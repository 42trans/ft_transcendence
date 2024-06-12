# docker/srcs/uwsgi-django/pong/views/tournament_views.py
import json
import logging
from typing import Any, Tuple
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.decorators import login_required
from ..models import Tournament, Match
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.views.decorators.http import require_POST
from django.utils.dateparse import parse_datetime
from django.forms.models import model_to_dict
# from ..models import PongGameResult
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
import random


logger = logging.getLogger('django')


User = get_user_model()


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
		print(f"Updated next match {next_match.id}: "
			  f"{next_match.player1} vs {next_match.player2}")


@csrf_exempt
@login_required
@require_http_methods(["POST"])
def save_game_result(request):
	try:
		data = json.loads(request.body)
		print("Received data:", data)
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

		return JsonResponse({"status": "success", "message": "Game result saved successfully."})
	except Exception as e:
		import traceback
		traceback.print_exc()  # サーバーのコンソールにエラーのトレースバックを出力
		return JsonResponse({"status": "error", "message": str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_latest_user_ongoing_tournament(request) -> JsonResponse:
	"""
	機能: 「最新」のトーナメントの情報を取得: 「ログイン中のユーザーが主催する未終了トーナメント」の。
	用途: 未終了の主催トーナメントの有無を判定(200 or 204)
	"""
	# 最新の未終了トーナメントを取得
	tournament = Tournament.objects.filter(
		organizer=request.user,
		is_finished=False
	).order_by('-date').first()

	if tournament:
		# トーナメントオブジェクトを辞書に変換して返す
		tournament_data = model_to_dict(tournament)
		return JsonResponse({'tournament': tournament_data}, safe=False)
	else:
		# 未終了のトーナメントがない場合は204と空のレスポンスを返す
		return JsonResponse({}, status=204)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_tournament_data_by_id(request, tournament_id) -> JsonResponse:
	""" 機能: ゲストも「ID」でトーナメント情報を取得: 指定されたトーナメントIDの。"""
	print('fetchTournamentDetail: 1')
	tournament = get_object_or_404(Tournament, pk=tournament_id)
	# print("Tournament:", tournament)
	print('fetchTournamentDetail: 2')
	data = {
		'id': tournament.id,
		'name': tournament.name,
		'date': tournament.date.isoformat(),
		'player_nicknames': list(tournament.player_nicknames),
		'organizer': tournament.organizer_id,
		'is_finished': tournament.is_finished
	}
	print('fetchTournamentDetail: 3')
	return JsonResponse(data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_matches_by_round_latest_user_ongoing_tournament(request, round_number) -> JsonResponse:
	""" 
	機能: 「round_number」のデータを全て取得: 「ログイン中のユーザーが主催する未終了トーナメント」の。
	用途: Round別のDisplay
	"""
	# ユーザーが主催する未終了のトーナメントに属する指定ラウンドの試合を取得
	matches = Match.objects.filter(
		tournament__organizer=request.user,
		tournament__is_finished=False,
		round_number=round_number
	).order_by('match_number')

	if not matches:
		# 試合が見つからない場合はエラー404
		return JsonResponse({'status': 'error', 'message': 'Round not found'}, status=404)

	matches_data = [model_to_dict(match) for match in matches]  # すべてのフィールドを取得
	# print("matches_data:", matches_data)
	for match_data in matches_data:
		if match_data['ended_at']:
			match_data['ended_at'] = match_data['ended_at'].isoformat()
		else:
			match_data['ended_at'] = None

	return JsonResponse({'matches': matches_data}, safe=False)


# ------------------------------
# create
# ------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_new_tournament_and_matches(request) -> JsonResponse:
	""" 
	- 機能: トーナメントの新規作成
	- 備考: トーナメントと「全7試合」も同時に作成する。 ログイン中のユーザーが主催者として。
	"""
	try:
		name					= request.POST.get('name')
		date_str				= request.POST.get('date')
		player_nicknames_json	= request.POST.get('player_nicknames', '[]')
		player_nicknames 		= json.loads(player_nicknames_json)
		randomize				= request.POST.get('randomize', False)

		# print("Received Data:", name, date_str, player_nicknames)

		# atomic: このブロック内を一つとして実行。途中でエラーが出たら開始前の状態に戻る
		with transaction.atomic():
			tournament = Tournament.objects.create(
				name=name,
				date=parse_datetime(date_str),
				player_nicknames=player_nicknames,
				organizer=request.user,
				is_finished=False
			)
			matches = _create_matches(tournament, player_nicknames, randomize)
		# ---------------ここまでatomic

		# トーナメントとマッチのIDを含むレスポンスを返す
		match_data = [{'round_number': m.round_number, 'match_number': m.match_number, 'id': m.id} for m in matches]
		return JsonResponse({'status': 'success', 'tournament_id': tournament.id, 'matches': match_data})

	except ValidationError as e:
		logger.error(f'create_new_tournament: ValidationError: {e.message_dict}')
		if e.message_dict:
			field = list(e.message_dict.keys())[0]
			error = e.message_dict[field][0]
			error_message = f'Invalid {field}: {error}'
		else:
			error_message = 'An error occurred'
		return JsonResponse({'status': 'error', 'message': error_message}, status=400)
	except Exception as e:
		logger.error(f'create_new_tournament: Exception: {str(e)}')
		return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


def _create_matches(tournament, player_nicknames, randomize=False):
	# test random
	# randomize = True
	'''
	引数 randomize=False:
		省略可能

	ランダム関数について:

		def shuffle(self, x):
			"""
			Shuffle list x in place, and return None.
			randbelow関数は、指定された数未満のランダムな整数を返すためのメソッド
			"""

			randbelow = self._randbelow
			for i in reversed(range(1, len(x))):
				# pick an element in x[:i+1] with which to exchange x[i]
				j = randbelow(i + 1)
				x[i], x[j] = x[j], x[i]
	'''
	# プレイヤーリストをランダムに並べ替える
	print("Original player_nicknames:", player_nicknames)
	if randomize:
		random.shuffle(player_nicknames)
		print("Shuffled player_nicknames:", player_nicknames)

	matches_info = [
		(1, 1, player_nicknames[0], player_nicknames[1]),
		(1, 2, player_nicknames[2], player_nicknames[3]),
		(1, 3, player_nicknames[4], player_nicknames[5]),
		(1, 4, player_nicknames[6], player_nicknames[7]),
		(2, 1, '', ''),
		(2, 2, '', ''),
		(3, 1, '', '')
	]
	print("Matches info:", matches_info) 
	# winner,is_finished(default=false)は未入力
	matches = []
	try:
		for round_number, match_number, player1, player2 in matches_info:
			match = Match.objects.create(
				tournament=tournament,
				round_number=round_number,
				match_number=match_number,
				player1=player1,
				player2=player2,
				winner=None,
				can_start=(round_number == 1)  # 第一ラウンドの場合はcan_startをTrueに設定
			) 
			print(f"Created match: Round {round_number}, Match {match_number}, Players {player1} vs {player2}")
			matches.append(match)
	except Exception as e:
		print(f"Error creating match: {e}")
		raise
	return matches


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_tournament_and_matches(request, tournament_id) -> JsonResponse:
	""" 
	機能:
	- 削除: トーナメントと「全7試合」。ログイン中のユーザーが主催者のものを。
	- 備考: このトーナメントに関連する「match」7試合も全て削除される。
	"""
	try:
		with transaction.atomic():
			tournament = Tournament.objects.get(id=tournament_id, organizer=request.user)
			if not tournament.is_finished:
				# トーナメントに関連する試合も削除
				# #class Match(models.Model):において、
				# - tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)が設定されている 
				# - related_name='matches' で逆方向のリレーションシップ
				# - on_delete=models.CASCADE でトーナメントが削除されると、自動的に削除される。
				tournament.matches.all().delete() #つまり、この行は不要。だが、明示的に記述する。
				tournament.delete()
				return JsonResponse({'status': 'success', 'message': 'Tournament and related matches deleted successfully.'}, status=200)
			else:
				return JsonResponse({'status': 'error', 'message': 'Cannot delete finished tournaments.'}, status=400)
	except Tournament.DoesNotExist:
		return JsonResponse({'status': 'error', 'message': 'Tournament not found.'}, status=404)

# ------------------------------
# option: 現時点では不要
# ------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_history_all_user_tournaments(request) -> JsonResponse:
	""" 
	機能: 「ユーザーが主催者」のトーナメントを全て取得
	用途: result, histoty. 終了したトーナメントも含む過去情報全てを取得
	"""
	# ログインユーザーが主催するトーナメントを全て取得
	tournaments = Tournament.objects.filter(organizer=request.user)
	# すべてのフィールドを含む辞書のリストに変換
	tournaments_data = [model_to_dict(tournament) for tournament in tournaments]
	return JsonResponse(tournaments_data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tournament_id_user_all_ongoing(request) -> JsonResponse:
	""" 
	機能: ログイン中のユーザーが主催する未終了のトーナメントの「ID」を全て返す。
	用途: エラーチェック。複数の未終了トーナメントが存在してはならないが、存在する場合はIDを返して削除作業を可能にする。
	"""
	tournaments = Tournament.objects.filter(organizer=request.user, is_finished=False)
	# 各トーナメントのIDをリストに格納
	tournament_ids = [tournament.id for tournament in tournaments]

	# 未終了のトーナメントが複数存在する場合はエラーメッセージと共にIDを返す
	if len(tournament_ids) > 1:
		return JsonResponse({
			'status': 'error',
			'message': 'Multiple ongoing tournaments found, which is not allowed.',
			'tournaments': tournament_ids
		# 200 OKでクライアントに処理可能なデータを返す
		}, status=200)

	return JsonResponse({'tournaments': tournament_ids}, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_matches_of_latest_tournament_user_ongoing(request) -> JsonResponse:
	""" 
	機能:「ユーザーが主催する && 未終了のトーナメント」 に関する全7試合のデータを返す。
	注意: ユーザーが主催する未終了のトーナメントは一つだけ存在すると想定。
	用途: トーナメントの試合情報を全て取得する
	注意: 現在の実装ではRoundごとに必要な情報だけ取得しているので未使用
	"""
	# ログインユーザーが主催している最新の未終了トーナメントを取得
	latest_tournament = Tournament.objects.filter(
		organizer=request.user,
		is_finished=False
	).order_by('-date').first()

	# 未終了のトーナメントがない場合
	if not latest_tournament:
		return JsonResponse({'status': 'success', 'message': 'No ongoing tournaments found'}, status=204)

	# 上記トーナメントに属する全試合を取得
	matches = Match.objects.filter(tournament=latest_tournament).order_by('round_number', 'match_number')
	# Djangoの `model_to_dict` でフィールドを辞書形式で取得し、関連するトーナメントの名前も取得
	matches_data = [
		{
			**model_to_dict(match),
			# 関連するトーナメント名を追加
			'tournament_name': match.tournament.name,
			# 日付をISO 8601形式に変換
			'ended_at': match.ended_at.isoformat() if match.ended_at else None,
			# 'date': match.date.isoformat() if match.date else None,
		}
		for match in matches
	]
	return JsonResponse({'matches': matches_data}, safe=False, status=200)
