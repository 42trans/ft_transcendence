# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import path
from . import views
from .blockchain import save_testnet
from .blockchain import fetch_testnet

urlpatterns = [
	path('api/save_testnet/<str:testnet_name>/', save_testnet.save_testnet, name='save_testnet'),
	path('api/fetch_testnet/<str:testnet_name>/', fetch_testnet.fetch_testnet, name='fetch_testnet'),
	
	path('api/save_game_result/', views.save_game_result, name='save_game_result'),
	path('save_game_result/', views.save_game_result, name='save_game_result'),
	path("", views.index, name="index"),
	path('results/', views.results, name='results'),
]
