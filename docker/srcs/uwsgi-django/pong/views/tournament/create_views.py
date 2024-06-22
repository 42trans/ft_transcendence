# docker/srcs/uwsgi-django/pong/views/tournament/create_views.py
import json
import logging
from django.http import JsonResponse, HttpResponse
from ...models import Tournament, Match
from django.db import transaction
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
import random

logger = logging.getLogger('django')
User = get_user_model()

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

