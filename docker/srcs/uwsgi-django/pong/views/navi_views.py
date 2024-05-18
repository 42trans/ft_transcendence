# docker/srcs/uwsgi-django/pong/views/navi_views.py
from django.shortcuts import redirect, render
from django.http import JsonResponse
import logging
from ..models import Tournament, Match
from django.shortcuts import get_object_or_404
from django.conf import settings

logger = logging.getLogger(__name__)

# @login_required
def tournament(request):
	if request.method == 'GET':
		return render(request, 'pong/tournament.html')
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)

def pong_view(request):
	# logger.debug("Test logger: pong_view() start")
	if request.user.is_authenticated:
		param = {
			'nickname': request.user.nickname
		}
		return render(request, 'pong/index.html', param)
	return render(request, 'pong/index.html')

# def results(request):
# 	results_list = PongGameResult.objects.all().order_by("-date")
# 	context = {'results_list': results_list}
# 	return render(request, 'pong/results.html', context)

# 3D
def play_tournament(request, match_id):
	match = get_object_or_404(Match, id=match_id)
	match_data = {
		"id": match.id,
		"round_number": match.round_number,
		"match_number": match.match_number,
		"player1": match.player1,
		"player2": match.player2,
		"player1_score": match.player1_score,
		"player2_score": match.player2_score,
		"is_finished": match.is_finished
	}
	context = {
		# viteコンテナで作成したjsをDjango dev serverでも使えるようにするため、Django の DEBUG 設定をwindow.に渡す
		'is_dev_server': settings.DEBUG,
		'match_json': JsonResponse(match_data, safe=False).content.decode()
	}
	# return render(request, 'pong/play-tournament.html', {'match': match})
	return render(request, 'pong/play-tournament.html', context)
	# return render(request, 'pong/play-tournament.html', {'match_json': JsonResponse(match_data, safe=False).content.decode()})

def game(request):
	return render(request, 'pong/game.html')


# ーーーーーーーーーーーーーーー
# old
# ーーーーーーーーーーーーーーー

# @csrf_exempt #開発用のおまじない
# def save_game_result(request):
# 	if request.method == 'POST':
# 		try:
# 			data = json.loads(request.body.decode('utf-8'))  # 受け取ったJSONデータをPythonの辞書に変換
# 			match_id = data.get('match_id')
# 			player_1_score = data.get('player_1_score')
# 			player_2_score = data.get('player_2_score')

# 			# 勝者を決定
# 			winner = data.get('player_1_name') if player_1_score > player_2_score else data.get('player_2_name')
# 			loser = data.get('player_2_name') if player_1_score > player_2_score else data.get('player_1_name')

# 			# PongGameResult インスタンスを作成して保存
# 			game_result = PongGameResult(
# 				match_id=match_id,
# 				player_1_score=player_1_score,
# 				player_2_score=player_2_score,
# 				name_winner=winner,
# 				# name_loser=loser,
# 			)
# 			game_result.save()

# 			return JsonResponse({'status': 'success'})
# 		except Exception as e:
# 			return JsonResponse({'status': 'error', 'message': str(e)})
# 	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)