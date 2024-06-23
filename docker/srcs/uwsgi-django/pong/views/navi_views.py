# docker/srcs/uwsgi-django/pong/views/navi_views.py
from django.shortcuts import redirect, render
from django.http import JsonResponse
import logging
from ..models import Tournament, Match
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db import transaction
from django.urls import reverse

logger = logging.getLogger(__name__)


def tournament(request):
	if not request.user.is_authenticated:
		return redirect(to='/accounts/login/')

	if request.method == 'GET':
		return render(request, 'pong/tournament.html')
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)

def pong_view(request):
	if request.user.is_authenticated:
		param = {
			'nickname'	: request.user.nickname,
			'user_id'	: request.user.id
		}
		return render(request, 'pong/index.html', param)
	return render(request, 'pong/index.html')

# 3D
def play_tournament(request, match_id):
	# match_idが整数でない場合の遷移
	try:
		match_id = int(match_id)
		if match_id <= 0:
			return redirect(to='/pong/')
	except ValueError:
		return redirect(to='/pong/')

	if not request.user.is_authenticated:
		return redirect(to='/accounts/login/')
	
	# 別のブラウザですでにプレイ中の場合　リダイレクト
	# TODO_ft-2:クライアント側で処理すべき？
	# TODO_ft-2:トーナメントtopに遷移した方が良さそう
	match = get_object_or_404(Match, id=match_id)
	if match.is_playing:
		# return JsonResponse({'is_playing': True})
		return redirect(to='/pong/')
		# return redirect(to='/tournament/')

	# 別のブラウザで複数起動しないようにatomicに処理
	with transaction.atomic():
		try:
			# プレイ中のフラグを立てて保存
			match.is_playing = True
			match.save()
			# ------------------------------------
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
			return render(request, 'pong/play-tournament.html', context)
		except Exception:
			return redirect(to='/pong/')

def game(request):
	return render(request, 'pong/game.html')

