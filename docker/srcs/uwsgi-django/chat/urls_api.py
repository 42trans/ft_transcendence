# chat/urls_api.py

from django.urls import path, re_path
from . import views, consumers
from chat.views.get_dm_list import GetDMListAPI
from chat.views.system_message import SystemMessageAPI


app_name = 'api_chat'

urlpatterns = [
    path('api/dm-list/', GetDMListAPI.as_view(), name='dm_list'),
    path('api/system-message/', SystemMessageAPI.as_view(), name='dm_system'),
]
