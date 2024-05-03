# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import include, path
from django.views.generic import TemplateView
from pong import views
from pong.blockchain import save_testnet
from pong.blockchain import fetch_testnet
from pong.blockchain import fetch_testnet
from pong.blockchain import record_game_result
from .views.tournament_views import tournament_create, tournament_data_id, list_all_user_tournaments, delete_tournament, get_user_ongoing_matches, get_matches_by_round, user_all_ongoing_tournament, get_latest_ongoing_tournament

# パスはapiが先頭につきます。ex./pong/api/tournament/create/
urlpatterns = [
	# testnetを指定する（DB保存なし）
	path('save_testnet/<str:testnet_name>/', save_testnet.save_testnet, name='save_testnet'),
	path('fetch_testnet/<str:testnet_name>/', fetch_testnet.fetch_testnet, name='fetch_testnet'),

	# ----------------------------------------
	# tournament
	# ----------------------------------------
	# 「ユーザーが主催する && 未終了のトーナメント」 に関する「全7試合」のデータを全て取得する
	path("tournament/user/ongoing/matches/all", get_user_ongoing_matches, name="get_user_ongoing_matches"),
	# 「ユーザーが主催する && 未終了のトーナメント」 に関する「round_number」のデータを全て取得する
	path("tournament/user/ongoing/matches/<int:round_number>/", get_matches_by_round, name="get_matches_by_round"),
	# トーナメントと「全7試合」の新規作成
	path("tournament/create/", tournament_create, name="tournament_create"),
	# 「ユーザーが主催する && 未終了のトーナメント」 データを全て返す
	path("tournament/user/ongoing/all/", user_all_ongoing_tournament, name="user_all_ongoing_tournament"),
	# ログイン中のユーザーが主催する未終了トーナメントのうち、「最新」のものを返す
	path("tournament/user/ongoing/latest/", get_latest_ongoing_tournament, name="get_latest_ongoing_tournament"),
	# 指定されたトーナメントIDのトーナメント情報を取得
	path("tournament/data/<int:tournament_id>/", tournament_data_id, name="tournament_data_id"),

	path("tournament/user/all/", list_all_user_tournaments, name="list_all_user_tournaments"),
	path('tournament/delete/<int:tournament_id>/', delete_tournament, name='delete_tournament'),
]

