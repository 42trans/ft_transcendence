# docker/srcs/uwsgi-django/pong/views/tournament_views.py
import json
import requests
from django.shortcuts import redirect, render
from django.conf import settings
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import logging
from django.contrib.auth.decorators import login_required
from ..models import Tournament, Match
from django.utils import timezone
from datetime import datetime
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_POST

User = get_user_model()

@login_required
@require_POST
def delete_tournament(request, tournament_id):
	try:
		tournament = Tournament.objects.get(id=tournament_id, organizer=request.user)
		if not tournament.is_finished:
			tournament.delete()
			return JsonResponse({'status': 'success', 'message': 'Tournament deleted successfully.'})
		else:
			return JsonResponse({'status': 'error', 'message': 'Cannot delete finished tournaments.'}, status=400)
	except Tournament.DoesNotExist:
		return JsonResponse({'status': 'error', 'message': 'Tournament not found.'}, status=404)
	
# @login_required
def user_ongoing(request):
	if request.method == 'GET':
		# ログインユーザーが主催するトーナメントを取得
		tournaments = Tournament.objects.filter(organizer=request.user).values('id', 'name', 'is_finished', 'date', 'organizer')
		return JsonResponse(list(tournaments), safe=False)
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=405)

def tournament_data(request, tournament_id):
	if request.method == 'GET':
		# 指定されたIDのトーナメントを取得
		tournament = get_object_or_404(Tournament, pk=tournament_id)
		data = {
			'id': tournament.id,
			'name': tournament.name,
			'date': tournament.date.isoformat(), 
			'player_nicknames': list(tournament.player_nicknames),
			'is_finished': tournament.is_finished,
			'organizer': tournament.organizer_id
		}
		return JsonResponse(data, safe=False)
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=405)
	
@login_required
def tournament_create(request):
	if request.method != 'POST':
		return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)

	# if request.method == 'POST':
	try:
		name					= request.POST.get('name')
		date_str				= request.POST.get('date')  # 'YYYY-MM-DDTHH:MM' 形式で受け取る
		player_nicknames_json	= request.POST.get('player_nicknames', '[]')
		player_nicknames 		= json.loads(player_nicknames_json)

		# 空ではないことを確認		
		if not date_str or not name or len(player_nicknames) != 8:
			return JsonResponse({'status': 'error', 'message': 'Invalid input data.'}, status=400)
		# 日付の形式を確認
		try:
			naive_datetime = datetime.strptime(date_str, "%Y-%m-%dT%H:%M")
		except ValueError:
			return JsonResponse({'status': 'error', 'message': "Invalid date format. Please use YYYY-MM-DDTHH:MM format."}, status=400)
		
		aware_datetime = timezone.make_aware(naive_datetime, timezone.get_current_timezone())

		# atomic: このブロック内を一つとして実行。途中でエラーが出たら開始前の状態に戻る
		with transaction.atomic():
			tournament = Tournament.objects.create(
				name=name,
				date=aware_datetime,
				player_nicknames=player_nicknames,
				organizer=request.user,
				is_finished=False
			)
			matches = schedule_matches(tournament, player_nicknames)
		# ---------------ここまでatomic
  
		# トーナメントとマッチのIDを含むレスポンスを返す
		match_data = [{'round_number': m.round_number, 'match_number': m.match_number, 'id': m.id} for m in matches]
		return JsonResponse({'status': 'success', 'tournament_id': tournament.id, 'matches': match_data})
	except Exception as e:
		return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
	
def schedule_matches(tournament, player_nicknames):
	matches_info = [
		(1, 1, player_nicknames[0], player_nicknames[1]),
		(1, 2, player_nicknames[2], player_nicknames[3]),
		(1, 3, player_nicknames[4], player_nicknames[5]),
		(1, 4, player_nicknames[6], player_nicknames[7]),
		(2, 1, 'winner1', 'winner2'),
		(2, 2, 'winner3', 'winner4'),
		(3, 1, 'winner5', 'winner6')
	]

	matches = [
		Match.objects.create(
			tournament=tournament,
			round_number=round_number,
			match_number=match_number,
			player1=player1,
			player2=player2
		) for round_number, match_number, player1, player2 in matches_info
	]
	return matches