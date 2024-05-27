# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import include, path
from .views.navi_views import tournament, game, pong_view, play_tournament
from .views.online.pong_online_view import pong_online
from .views.online.duel.pong_online_duel_view import pong_online_duel
from .views.online.duel.duel_session_view import DuelSessionsView
from .views.online.duel.duel_room_view import DuelRoomView
# from .views.online.duel.duel_view import DuelView

# api/をurls_api.pyに移動(国際化・多言語対応のため)

app_name = 'pong'

urlpatterns = [
	# --------------------------------------------------------------
	# Duel
	# --------------------------------------------------------------
	# as_view(): クラスをインスタンス化し、HTTPリクエストに対応するメソッドを呼びだす
	path('online/duel/room/<str:room_name>/', DuelRoomView.as_view(), name='duel_room'),
	path('online/duel/duel-session/', DuelSessionsView.as_view(), name='duel_session'),
    # path('online/duel/duel-with/<str:target_nickname>/', DuelView.as_view(), name='duel'),
	path("online/duel/", DuelSessionsView.as_view(), name="duel"),
	# --------------------------------------------------------------
	path("online/", pong_online, name="pong_online"),
	path("tournament/", tournament, name="tournament"),
	# path('results/', results, name='results'),
	path("game/", game, name="game"),
	path("play/<int:match_id>", play_tournament, name="play_tournament"),
	# root（一番下に記述する。上から順にマッチ評価されるため） ex. https://localhost/pong/
	path("", pong_view, name="index"),
]

	# DBとtestnetの同時記録
	# path('api/record_game_result/<str:testnet_name>/', record_game_result.record_game_result, name='record_game_result'),
	
	# 過去に作成した使っていないもの play用

	# path('save_game_result/', views.save_game_result, name='save_game_result'),