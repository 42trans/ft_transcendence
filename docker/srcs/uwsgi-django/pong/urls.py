# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import path
from . import views
from .view_modules import save_testnet
from .evm_testnet.hardhat_net import save_hardhat
from .view_modules import get_all_results_from_testnet

urlpatterns = [
	path('api/save_testnet/', save_testnet.save_testnet, name='save_testnet'),
	path('api/save_hardhat/', save_hardhat.save_hardhat, name='save_hardhat'),
	path('api/get_all_results_from_testnet/', get_all_results_from_testnet.get_all_results_from_testnet, name='get_all_results_from_testnet'),
	path('api/save_game_result/', views.save_game_result, name='save_game_result'),
	path('save_game_result/', views.save_game_result, name='save_game_result'),
	path("", views.index, name="index"),
	path('results/', views.results, name='results'),
]
