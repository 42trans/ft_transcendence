# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import path
from . import views
from .view_modules import save_testnet
from .view_modules import get_all_results_from_testnet

urlpatterns = [
	path('api/save_testnet/', save_testnet.save_testnet, name='save_testnet'),
	path('api/get_all_results_from_testnet/', get_all_results_from_testnet.get_all_results_from_testnet, name='get_all_results_from_testnet'),
	# path('get_game_result_hardhat/', get_game_results_hardhat.get_all_game_results_hardhat, name='get_game_result_hardhat'),
	# path('api/save_game_result/', views.save_game_result, name='save_game_result'),
	# path('save_game_result/', views.save_game_result, name='save_game_result'),
	path("", views.index, name="index"),
	path('results/', views.results, name='results'),
]
