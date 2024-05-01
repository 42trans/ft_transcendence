# chat/urls_api.py

from django.urls import path, re_path
from . import views, consumers
from chat.views.get_dm_list import GetDMList
from chat.views.send_message import SendMessage


app_name = 'api_chat'

urlpatterns = [
    # path('api/<str:nickname>/', views.dm_room, name='api_dm'),
    path('api/list/', GetDMList.as_view(), name='dm_list'),
    path('api/messages/<str:nickname>/', SendMessage.as_view(), name='dm_details'),
]
