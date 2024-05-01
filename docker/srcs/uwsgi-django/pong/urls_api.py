# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import include, path
from django.views.generic import TemplateView
from pong import views
from pong.blockchain import save_testnet
from pong.blockchain import fetch_testnet
from pong.blockchain import fetch_testnet
from pong.blockchain import record_game_result
from .views.tournament_views import tournament_create, tournament_data, user_ongoing, delete_tournament

# パスはapiが先頭につきます。ex./pong/api/tournament/create/
urlpatterns = [
	# testnetを指定する（DB保存なし）
	path('save_testnet/<str:testnet_name>/', save_testnet.save_testnet, name='save_testnet'),
	path('fetch_testnet/<str:testnet_name>/', fetch_testnet.fetch_testnet, name='fetch_testnet'),
	path("tournament/create/", tournament_create, name="tournament_create"),
	path("tournament/data/<int:tournament_id>/", tournament_data, name="tournament_data"),
	path("tournament/user/ongoing/", user_ongoing, name="user_ongoing"),
	path('tournament/delete/<int:tournament_id>/', delete_tournament, name='delete_tournament'),
]

