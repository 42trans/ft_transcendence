# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import path
from . import views

urlpatterns = [
	path('api/save_game_result/', views.save_game_result, name='save_game_result'),
	path('save_game_result/', views.save_game_result, name='save_game_result'),
	path("", views.index, name="index"),
	path('results/', views.results, name='results'),
]
