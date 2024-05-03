# docker/srcs/uwsgi-django/pong/views/tournament_views.py
import json
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.decorators import login_required
from ..models import Tournament, Match
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_POST
from django.utils.dateparse import parse_datetime
from django.forms.models import model_to_dict

User = get_user_model()


@login_required
def user_all_ongoing_tournament(request):
	""" 
	機能: ログイン中のユーザーが主催する未終了のトーナメントのうち、「全て」のデータを返す
	"""
	if request.method == 'GET':
		# ログインユーザーが主催していてまだ終了していないトーナメントを取得
		tournaments = Tournament.objects.filter(organizer=request.user, is_finished=False)
		# 各トーナメントオブジェクトを辞書に変換してリストに格納
		tournaments_data = [model_to_dict(tournament) for tournament in tournaments]
		return JsonResponse({'tournaments': tournaments_data}, safe=False)
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

# TODO_ft:試合も削除するようcreateを参考に
@login_required
@require_POST
def delete_tournament(request, tournament_id):
	""" 機能: トーナメントを削除する。「ユーザーが主催する && 未終了のトーナメント」 のトーナメントを。 """
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
def list_all_user_tournaments(request):
	""" 
	機能: 「ユーザーが主催者」のトーナメントを全て取得する
	用途: 終了したトーナメントも含む過去情報全てを取得。
	状態: 現時点の実装では不要
	"""
	if request.method == 'GET':
		# ログインユーザーが主催するトーナメントを取得
		tournaments = Tournament.objects.filter(organizer=request.user).values('id', 'name', 'is_finished', 'date', 'organizer')
		return JsonResponse(list(tournaments), safe=False)
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=405)


# ------------------------------
# test 済み
# ------------------------------
def tournament_data_id(request, tournament_id):
	if request.method == 'GET':
		""" 機能: 指定されたトーナメントIDのトーナメント情報を取得"""
		tournament = get_object_or_404(Tournament, pk=tournament_id)

		# print("Tournament:", tournament)
		# print("Organizer ID:", tournament.organizer_id)

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


# ------------------------------
# ongoing 
# ------------------------------
@login_required
def get_latest_ongoing_tournament(request):
	"""
	機能: ログイン中のユーザーが主催する未終了トーナメントのうち、「最新」のものを返す
	"""
	if request.method == 'GET':
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
			return HttpResponse(status=204)
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@login_required
def get_matches_by_round(request, round_number):
	""" 
	機能:指定されたラウンド番号の試合データを返す
	用途:Round別のDisplay
	"""
	if request.method == 'GET':
		# ユーザーが主催する未終了のトーナメントに属する指定ラウンドの試合を取得
		matches = Match.objects.filter(
			tournament__organizer=request.user,
			tournament__is_finished=False,
			round_number=round_number
		).order_by('match_number')

		if not matches:
			# 試合が見つからない場合はエラー404
			return JsonResponse({'status': 'error', 'message': 'Round not found'}, status=404)

		matches_data = [
			{
				'id': match.id,
				'tournament_id': match.tournament.id,
				'round_number': match.round_number,
				'match_number': match.match_number,
				'player1': match.player1,
				'player2': match.player2,
				'player1_score': match.player1_score,
				'player2_score': match.player2_score,
				'is_finished': match.winner is not None,
				'date': match.date.isoformat(),
				'tournament_name': match.tournament.name,
			}
			for match in matches
		]
		return JsonResponse({'matches': matches_data}, safe=False)
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@login_required
def get_user_ongoing_matches(request):
	""" 
	機能:「ユーザーが主催する && 未終了のトーナメント」 に関する全7試合のデータを返す。
	注意: ユーザーが主催する未終了のトーナメントは一つだけ存在すると想定。
	状況: 現時点の実装では不要
	"""
	if request.method == 'GET':
		# # ログインユーザーが主催している最新の未終了トーナメントを取得
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
				'date': match.date.isoformat() if match.date else None,
			}
			for match in matches
		]
		return JsonResponse({'matches': matches_data}, safe=False)
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

# ------------------------------
# create
# ------------------------------
@login_required
def tournament_create(request):
	""" トーナメントの新規作成。トーナメントの試合のデータも同時に作成する"""

	if request.method != 'POST':
		return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)

	try:
		name					= request.POST.get('name')
		date_str				= request.POST.get('date')
		player_nicknames_json	= request.POST.get('player_nicknames', '[]')
		player_nicknames 		= json.loads(player_nicknames_json)

		# 空ではないことを確認		
		if (
			not date_str or 
			not name or 
			len(player_nicknames) != 8 or 
			any(nickname.strip() == '' for nickname in player_nicknames)
		):
			return JsonResponse({'status': 'error', 'message': 'Invalid input data.'}, status=400)
	
		# 日付のフォーマットを確認 UTC ISO8601
		aware_datetime = parse_datetime(date_str)
		if (
			aware_datetime is None or 
			not aware_datetime.tzinfo
		):
			return JsonResponse({'status': 'error', 'message': "Invalid: Please use ISO 8601 format."}, status=400)
		
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

	# winnerは未入力
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