# chat/urls.py

from django.urls import path, re_path
from chat.views.views import chat_room, dm_room, dm_list, test, index


app_name = 'chat'

urlpatterns = [
    path('<str:room_name>/', chat_room, name='room'),
    # path('dm/<str:sender>/<str:nickname>/', views.dm_room, name='dm'),
    path('dm/<str:nickname>/', dm_room, name='dm'),
    path('test/dm-list/', dm_list, name='dm_list'),
    path('test/test/', test, name='test'),
    path('', index, name='index'),
]
