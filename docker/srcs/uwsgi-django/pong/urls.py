# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import path
from . import views
from .view_modules import save_game_results_hardhat
from .view_modules import get_game_results_hardhat

urlpatterns = [
	path('save_game_result_hardhat/', save_game_results_hardhat.save_game_result_hardhat, name='save_game_result_hardhat'),
	path('get_game_result_hardhat/', get_game_results_hardhat.get_all_game_results_hardhat, name='get_game_result_hardhat'),
	path('api/save_game_result/', views.save_game_result, name='save_game_result'),
	path('save_game_result/', views.save_game_result, name='save_game_result'),
	path("", views.index, name="index"),
	path('results/', views.results, name='results'),
]
