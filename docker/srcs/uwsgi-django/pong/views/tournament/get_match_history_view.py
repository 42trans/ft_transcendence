# docker/srcs/uwsgi-django/pong/views/tournament/get_views.py
import logging
from django.http import JsonResponse, HttpResponse
from ...models import Tournament, Match
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.forms.models import model_to_dict
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

logger = logging.getLogger('django')
User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_match_history(request) -> JsonResponse:
	"""
	機能: 主催者が主催したトーナメントでプレイした最新の100件のマッチを取得し、統計情報を加えて返す。
	 - レスポンスに使用する配列では nicknameを You と書き換える。その配列を用いて統計情報を計算する。
	"""
	# 主催者が主催したトーナメントを取得
	tournaments = Tournament.objects.filter(organizer=request.user).order_by('-date')

	# マッチデータを格納する配列
	matches_data = []

	# 各トーナメントについて処理
	for tournament in tournaments:
		# トーナメントでの主催者のニックネームを取得
		organizer_nickname = tournament.player_nicknames[tournament.player_nicknames.index(request.user.nickname)]

		# 主催者がプレイしたマッチを取得
		# .order_by('-ended_at'): 新しい順
		matches = Match.objects.filter(tournament=tournament).order_by('-ended_at')

		# マッチデータを配列に格納し、ニックネームを "You" に置換
		for match in matches:
			if (
				match.player1 == organizer_nickname or 
				match.player2 == organizer_nickname
			):
				# matchオブジェクトを辞書形式に変換
				match_data = model_to_dict(match)
				if match_data['player1'] == organizer_nickname:
					match_data['player1'] = 'You'
				if match_data['player2'] == organizer_nickname:
					match_data['player2'] = 'You'
				if match_data['winner'] == organizer_nickname:
					match_data['winner'] = 'You'

				# 日時を文字列形式に変換
				if match_data['ended_at']:
					match_data['ended_at'] = match_data['ended_at'].isoformat()
				else:
					match_data['ended_at'] = None

				matches_data.append(match_data)

	# 最新の100件のマッチを取得
	latest_matches_data = matches_data[:100]

	# 統計情報を計算
	stats = calculate_user_stats(latest_matches_data)

	# マッチデータと統計情報を返す
	response_data = {
		'matches': latest_matches_data,
		'stats': stats
	}
	return JsonResponse(response_data, safe=False)


def calculate_user_stats(matches):
	"""
	統計情報を計算する関数
	"""
	# total_matches = len(matches)
	total_matches = 0
	wins = 0
	total_points_scored = 0
	total_points_lost = 0

	# 勝利数
	for match in matches:
		if match['winner'] is not None:
			total_matches += 1
			if match['winner'] == 'You':
				wins += 1
	# 敗北数
	losses = total_matches - wins
	# 勝率
	if total_matches > 0:
		win_rate = wins / total_matches
	else:
		win_rate = 0

	# 総得失点の計算 ※リターンに含めない
	for match in matches:
		if match['player1'] == 'You':
			total_points_scored += match['player1_score']
			total_points_lost += match['player2_score']
		else:
			total_points_scored += match['player2_score']
			total_points_lost += match['player1_score']

	# 平均得失点の計算
	if total_matches > 0:
		avg_points_scored = total_points_scored / total_matches
		avg_points_lost = total_points_lost / total_matches
	else:
		avg_points_scored = 0
		avg_points_lost = 0

	stats = {
		'total_matches': total_matches,
		'wins': wins,
		'losses': losses,
		'win_rate': win_rate,
		'avg_points_scored': avg_points_scored,
		'avg_points_lost': avg_points_lost
	}
	return stats