# chat/urls.py

from django.urls import path, re_path
from . import views


app_name = 'chat'

urlpatterns = [
    path('<str:room_name>/', views.chat_room, name='room'),
    # path('dm/<str:sender>/<str:nickname>/', views.dm_room, name='dm'),
    path('dm/<str:nickname>/', views.dm_room, name='dm'),
    path('test/dm-list/', views.dm_list, name='dm_list'),
    path('test/test/', views.test, name='test'),
    path('', views.index, name='index'),
]
