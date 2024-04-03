# docker/srcs/uwsgi-django/pong/views.py
import json
from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import PongGameResult

def index(request):
	return HttpResponse("<h1>[Pong]</h1> <p>index</p>")
	return render(request, 'pong/index.html')

def sign_in(request):
	return render(request, 'pong/sign-in.html')

def sign_up(request):
	return render(request, 'pong/sign-up.html')

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
