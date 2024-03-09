# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import path
from . import views
from .view_modules import game_results

urlpatterns = [
	path('api/save_game_result/', views.save_game_result, name='save_game_result'),
	path('save_game_result/', views.save_game_result, name='save_game_result'),
	path('save_game_result_hardhat/', game_results.save_game_result_hardhat, name='save_game_result_hardhat'),
	path("", views.index, name="index"),
	path('results/', views.results, name='results'),
]
