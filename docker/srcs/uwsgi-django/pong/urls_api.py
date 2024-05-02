# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import include, path
from django.views.generic import TemplateView
from pong import views
from pong.blockchain import save_testnet
from pong.blockchain import fetch_testnet
from pong.blockchain import fetch_testnet
from pong.blockchain import record_game_result
from .views.tournament_views import tournament_create, tournament_data, user_ongoing, delete_tournament, get_user_ongoing_matches, get_matches_by_round

# パスはapiが先頭につきます。ex./pong/api/tournament/create/
urlpatterns = [
	# testnetを指定する（DB保存なし）
	path('save_testnet/<str:testnet_name>/', save_testnet.save_testnet, name='save_testnet'),
	path('fetch_testnet/<str:testnet_name>/', fetch_testnet.fetch_testnet, name='fetch_testnet'),
	# tournament
	# 「ユーザーが主催する && 未終了のトーナメント」 に関する「全7試合」のデータを全て取得する
	path("tournament/user/ongoing/all_matches/", get_user_ongoing_matches, name="get_user_ongoing_matches"),
	path("tournament/user/ongoing/matches/<int:round_number>/", get_matches_by_round, name="get_matches_by_round"),
	path("tournament/create/", tournament_create, name="tournament_create"),

	path("tournament/data/<int:tournament_id>/", tournament_data, name="tournament_data"),
	path("tournament/user/ongoing/", user_ongoing, name="user_ongoing"),
	path('tournament/delete/<int:tournament_id>/', delete_tournament, name='delete_tournament'),
]

