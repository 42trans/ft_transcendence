# chat/urls.py

from django.urls import path, re_path

from . import views, consumers


app_name = 'chat'

urlpatterns = [
    path('<str:room_name>/', views.room, name='room'),
    path('dm/<str:nickname>/', views.dm_view, name='dm'),
    path('', views.index, name='index'),
]
