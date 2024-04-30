# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import include, path
from django.views.generic import TemplateView
from pong import views
from pong.blockchain import save_testnet
from pong.blockchain import fetch_testnet
from pong.blockchain import fetch_testnet
from pong.blockchain import record_game_result

urlpatterns = [
	# testnetを指定する（DB保存なし）
	path('save_testnet/<str:testnet_name>/', save_testnet.save_testnet, name='save_testnet'),
	path('fetch_testnet/<str:testnet_name>/', fetch_testnet.fetch_testnet, name='fetch_testnet'),
	path('tournament/delete/<int:tournament_id>/', views.delete_tournament, name='delete_tournament'),
	path("tournament/data/", views.tournament_data, name="tournament_data"),
	path("tournament/create/", views.tournament_create, name="tournament_create"),
	path("tournament/user/ongoing/", views.user_ongoing, name="user_ongoing"),
]

