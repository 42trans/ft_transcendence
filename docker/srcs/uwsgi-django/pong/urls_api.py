# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import path
from pong.blockchain import save_testnet
from pong.blockchain import fetch_testnet
from pong.blockchain import fetch_testnet
from pong.blockchain import record_game_result
from .views.tournament_views import (
	create_new_tournament_and_matches, 
	get_tournament_data_by_id, 
	get_history_all_user_tournaments, 
	delete_tournament_and_matches, 
	get_matches_of_latest_tournament_user_ongoing, 
	get_matches_by_round_latest_user_ongoing_tournament, 
	get_tournament_id_user_all_ongoing, get_latest_user_ongoing_tournament,
	save_game_result
)

# パスはapiが先頭につきます。ex./pong/api/tournament/create/
urlpatterns = [
	# ----------------------------------------
	# Blockchain
	# ----------------------------------------
	# testnetを指定する（DB保存なし）
	path('save_testnet/<str:testnet_name>/', save_testnet.save_testnet, name='save_testnet'),
	path('fetch_testnet/<str:testnet_name>/', fetch_testnet.fetch_testnet, name='fetch_testnet'),
	# ----------------------------------------
	# ofline tournament
	# ----------------------------------------
	# 「最新」のトーナメントの情報を取得: 「ログイン中のユーザーが主催する未終了トーナメント」の。
	path("tournament/user/ongoing/latest/", get_latest_user_ongoing_tournament, name="get_latest_user_ongoing_tournament"),
	#  ゲストも「ID」でトーナメント情報を取得: 指定されたトーナメントIDの。
	path("tournament/data/<int:tournament_id>/", get_tournament_data_by_id, name="get_tournament_data_by_id"),
	# 「round_number」のデータを全て取得: 「ログイン中のユーザーが主催する未終了トーナメント」の。
	path("tournament/user/ongoing/matches/<int:round_number>/", get_matches_by_round_latest_user_ongoing_tournament, name="get_matches_by_round_latest_user_ongoing_tournament"),

	# 新規作成: トーナメントと「全7試合」。 ログイン中のユーザーが主催者として。
	path("tournament/create/", create_new_tournament_and_matches, name="create_new_tournament_and_matches"),
	# 削除: トーナメントと「全7試合」。ログイン中のユーザーが主催者のものを。
	path('tournament/delete/<int:tournament_id>/', delete_tournament_and_matches, name='delete_tournament_and_matches'),

	path('tournament/save_game_result/', save_game_result, name='save_game_result'),
		# -------------------------------
		# 未使用（汎用的なものを用意）
		# -------------------------------
		# 「ユーザーが主催者」のトーナメントを全て取得
		path("tournament/user/all/", get_history_all_user_tournaments, name="get_history_all_user_tournaments"),
		# 「ユーザーが主催する && 未終了のトーナメント」 のidを全て返す
		path("tournament/user/ongoing/all/", get_tournament_id_user_all_ongoing, name="get_tournament_id_user_all_ongoing"),
		# 「ユーザーが主催する && 未終了のトーナメント」 に関する「全7試合」のデータを全て取得する
		path("tournament/user/ongoing/matches/all", get_matches_of_latest_tournament_user_ongoing, name="get_matches_of_latest_tournament_user_ongoing"),
]
