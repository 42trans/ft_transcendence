# chat/routing.py
from django.urls import re_path
from chat.consumers import ChatConsumer
from chat.dm_consumers import DMConsumer


websocket_urlpatterns = [
    re_path(r'ws/dm-with/(?P<nickname>\w+)/$', DMConsumer.as_asgi()),
]
