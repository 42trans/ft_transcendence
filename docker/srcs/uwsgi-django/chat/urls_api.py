# chat/urls.py

from django.urls import path, re_path

from . import views, consumers


app_name = 'chat'

urlpatterns = [
    path('api/dm/<str:nickname>/', views.dm_room, name='api_dm'),
    path('api/dm-list/', views.dm_list, name='api_dm_list'),
]
