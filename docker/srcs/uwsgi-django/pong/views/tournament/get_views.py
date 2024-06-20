# docker/srcs/uwsgi-django/pong/views/tournament/get_views.py
# import json
import logging
# from typing import Any, Tuple
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.decorators import login_required
from ...models import Tournament, Match
from django.shortcuts import get_object_or_404
# from django.db import transaction
from django.contrib.auth import get_user_model
# from django.core.exceptions import ValidationError
# from django.views.decorators.http import require_POST
# from django.utils.dateparse import parse_datetime
from django.forms.models import model_to_dict
# from ..models import PongGameResult
# from django.views.decorators.csrf import csrf_exempt
# from django.views.decorators.http import require_http_methods
# from django.utils import timezone
# from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework.response import Response
# from rest_framework.views import APIView
# import random

logger = logging.getLogger('django')
User = get_user_model()

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
@permission_classes([IsAuthenticated])
def get_tournament_data_by_id(request, tournament_id) -> JsonResponse:
	""" 機能: 「ID」でトーナメント情報を取得: 指定されたトーナメントIDの。"""
	# print('fetchTournamentDetail: 1')
	tournament = get_object_or_404(Tournament, pk=tournament_id)
	# print("Tournament:", tournament)
	# print('fetchTournamentDetail: 2')
	data = {
		'id': tournament.id,
		'name': tournament.name,
		'date': tournament.date.isoformat(),
		'player_nicknames': list(tournament.player_nicknames),
		'organizer': tournament.organizer_id,
		'is_finished': tournament.is_finished
	}
	# print('fetchTournamentDetail: 3')
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
