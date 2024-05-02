# docker/srcs/uwsgi-django/pong/views.py
import json
import requests
import secrets
from django.shortcuts import redirect, render
from django.conf import settings
from django.urls import reverse
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from ..models import PongGameResult
import logging
from django.contrib.auth.decorators import login_required
# from .tournament.tournament_forms import TournamentForm
from ..models import Tournament, Match
from django.utils import timezone
from datetime import datetime
from django.core import serializers
from django.http import HttpResponseBadRequest
from django.views.decorators.http import require_POST
from django.contrib.auth import get_user_model
from django.core.serializers import serialize
from django.shortcuts import get_object_or_404
from django.db import transaction

logger = logging.getLogger(__name__)

# @login_required
def tournament(request):
	if request.method == 'GET':
		return render(request, 'pong/tournament.html')
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)
	
def pong_view(request):
	if request.user.is_authenticated:
		param = {
			'nickname': request.user.nickname
		}
		return render(request, 'pong/index.html', param)
	return render(request, 'pong/index.html')

def results(request):
	results_list = PongGameResult.objects.all().order_by("-date")
	context = {'results_list': results_list}
	return render(request, 'pong/results.html', context)


@csrf_exempt #開発用のおまじない
def save_game_result(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body.decode('utf-8'))  # 受け取ったJSONデータをPythonの辞書に変換
			match_id = data.get('match_id')
			player_1_score = data.get('player_1_score')
			player_2_score = data.get('player_2_score')

			# 勝者を決定
			winner = data.get('player_1_name') if player_1_score > player_2_score else data.get('player_2_name')
			loser = data.get('player_2_name') if player_1_score > player_2_score else data.get('player_1_name')

			# PongGameResult インスタンスを作成して保存
			game_result = PongGameResult(
				match_id=match_id,
				player_1_score=player_1_score,
				player_2_score=player_2_score,
				name_winner=winner,
				name_loser=loser,
			)
			game_result.save()

			return JsonResponse({'status': 'success'})
		except Exception as e:
			return JsonResponse({'status': 'error', 'message': str(e)})
	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

# 3D
def game(request):
	return render(request, 'pong/game.html')