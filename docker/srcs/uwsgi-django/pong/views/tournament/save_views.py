# docker/srcs/uwsgi-django/pong/views/tournament/save_views.py
import json
import logging
from typing import Any, Tuple
from django.http import JsonResponse, HttpResponse
from ...models import Tournament, Match
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from pong.utils.async_logger import sync_log, async_log
from chat.views.system_message import send_direct_system_message  
from django.views.decorators.http import require_POST
import random
from asgiref.sync import async_to_sync
# from django.core.cache import cache
from .signals import round_finished
from django.dispatch import receiver

logger = logging.getLogger('django')
User = get_user_model()

DEBUG_FLOW = 0
DEBUG_DETAIL = 0

@require_POST
def release_match(request, match_id):
	match = get_object_or_404(Match, id=match_id)
	match.is_playing = False
	match.save()
	return JsonResponse({'status': 'ok'})

def assign_winner_to_next_match(current_match: Match, winner_nickname: str):
	def __is_valid_argument(current_match: Match,
							winner_nickname: str) -> Tuple[bool, Any]:
		if not winner_nickname:
			return False, 'No nickname provided'

		if not current_match or not isinstance(current_match, Match):
			return False, 'No current_match provided'

		if not current_match.is_finished:
			return False, 'Current_match not finished'

		if (current_match.player1 != winner_nickname
				and current_match.player2 != winner_nickname):
			return False, f'No {winner_nickname} in current match'
		return True, None

	is_valid, err = __is_valid_argument(current_match, winner_nickname)
	if not is_valid:
		raise ValueError(err)

	# 次のラウンドの試合番号を計算
	next_round_number = current_match.round_number + 1
	next_match_number = (current_match.match_number + 1) // 2
	# 次のラウンドの試合を検索
	next_match = Match.objects.filter(
		tournament=current_match.tournament,
		round_number=next_round_number,
		match_number=next_match_number
	).first()
	if next_match:
		# 奇数試合番号から来る勝者は player1、偶数試合番号から来る勝者は player2
		if current_match.match_number % 2 == 1:
			# 奇数試合番号
			next_match.player1 = winner_nickname
		else:
			# 偶数試合番号
			next_match.player2 = winner_nickname
		
		# 次のマッチが開始可能かどうかチェック（両プレイヤーが割り当てられたか）
		if next_match.player1 and next_match.player2:
			next_match.can_start = True

		next_match.save()
		# print(f"Updated next match {next_match.id}: "
		# 	  f"{next_match.player1} vs {next_match.player2}")

def is_round_finished(tournament, round_number):
	""" 「指定されたラウンド」が終了したかどうかを確認する"""
	matches = Match.objects.filter(tournament=tournament, round_number=round_number)
	# return all(match.is_finished for match in matches)
	for match in matches:
		if not match.is_finished:
			return False
	return True

def is_tournament_finished(tournament):
	"""「全ての試合」が終了したかどうかを確認する"""
	matches = Match.objects.filter(tournament=tournament)
	for match in matches:
		if not match.is_finished:
			return False
	return True


# @csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_game_result(request):
	"""試合結果を保存する"""
	try:
		if DEBUG_FLOW:
			sync_log('save_game_result(): start')

		data = json.loads(request.body)
		match_id = data.get('match_id')
		player1_score = data.get('player1_score', 0)
		player2_score = data.get('player2_score', 0)
		match = get_object_or_404(Match, id=match_id)
		if player1_score > player2_score:
			winner = match.player1
		else:
			winner = match.player2
		# マッチの更新
		match.winner = winner
		match.player1_score = player1_score
		match.player2_score = player2_score
		match.ended_at		= timezone.now()
		match.is_finished	= True
		match.save()

		if winner:
			assign_winner_to_next_match(match, winner)
		
		# ラウンドの最終試合の場合 次のラウンドの開始をDMする
		current_round = match.round_number
		if is_round_finished(match.tournament, current_round):
			if DEBUG_FLOW:
				sync_log(f'save_game_result(): is_round_finished: {is_round_finished}')
			match.tournament.last_finished_round = current_round
			match.tournament.save()
			# シグナルを発行　=>  @receiver(round_finished)によって、次のラウンドの開始メッセージを送信する関数 handle_round_finished() を呼び出す
			round_finished.send(sender=match.tournament, current_round=current_round)
			if DEBUG_FLOW:
				sync_log(f'round_finished.send')

		# トーナメントの全試合が終了していた場合、 is_Finisjed を立てる
		if is_tournament_finished(match.tournament):
			match.tournament.is_finished = True
			match.tournament.save()

		if DEBUG_FLOW:
				sync_log(f'save_game_result(): done')

		return JsonResponse({"status": "success", "message": "Game result saved successfully."})
	except Exception as e:
		import traceback
		# サーバーのコンソールにエラーのトレースバックを出力
		traceback.print_exc() 
		return JsonResponse({"status": "error", "message": str(e)}, status=400)


@receiver(round_finished)
def handle_round_finished(sender, **kwargs):
	"""
	※Djangoのシグナルディスパッチャー: 
	- 同期的な動作を前提としているため、非同期関数を直接シグナルハンドラとして使用することができない。
	- そのために、asyncをつけず同期関数として定義し、async_to_sync()を用いて非同期関数を処理する
	"""
	if DEBUG_FLOW:
		sync_log('handle_round_finished(): start')
	tournament = sender
	current_round = kwargs['current_round']
	send_system_message_to_organizer(tournament, current_round + 1)


def send_system_message_to_organizer(tournament, next_round):
	"""
	send_direct_system_message()が非同期処理を行うが、同期関数として扱う。※Djangoのシグナルディスパッチャーを利用するため。
	"""
	if DEBUG_FLOW:
		sync_log('send_system_message_to_organizer(): start')
	organizer_nickname = tournament.organizer.nickname
	if next_round == 4:
		message = f"トーナメント「{tournament.name}」が終了しました！"
	else:
		message = f"トーナメント「{tournament.name}」のラウンド{next_round}が始まりました！"
	if DEBUG_FLOW:
		async_log('send_system_message_to_organizer(): done')
	return async_to_sync(send_direct_system_message)(organizer_nickname, message)