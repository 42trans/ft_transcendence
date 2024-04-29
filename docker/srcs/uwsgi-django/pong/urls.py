# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import include, path
from django.views.generic import TemplateView
from pong import views
from pong.blockchain import save_testnet
from pong.blockchain import fetch_testnet
from pong.blockchain import fetch_testnet
from pong.blockchain import record_game_result

# api/をurls_api.pyに移動(国際化・多言語対応のため)

urlpatterns = [
	path("tournament/", views.tournament, name="tournament"),
	path('results/', views.results, name='results'),
	path("game/", views.game, name="game"),
	# root（一番下に記述する。上から順にマッチ評価されるため） ex. https://localhost/pong/
	path("", views.pong_view, name="index"),
]

	# DBとtestnetの同時記録
	# path('api/record_game_result/<str:testnet_name>/', record_game_result.record_game_result, name='record_game_result'),
	
	# 過去に作成した使っていないもの play用
	# path('api/save_game_result/', views.save_game_result, name='save_game_result'),
	# path('save_game_result/', views.save_game_result, name='save_game_result'),