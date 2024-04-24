# chat/urls_api.py

from django.urls import path, re_path
from . import views, consumers
from chat.views import DMListAPI, MessagesAPI


app_name = 'api_chat'

urlpatterns = [
    # path('api/<str:nickname>/', views.dm_room, name='api_dm'),
    path('api/list/', DMListAPI.as_view(), name='dm_list'),
    path('api/messages/<str:nickname>/', MessagesAPI.as_view(), name='dm_details'),
]
