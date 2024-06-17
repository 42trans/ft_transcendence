# chat/routing.py
from django.urls import re_path
from chat.dm_consumers import DMConsumer


websocket_urlpatterns = [
    re_path(r'ws/dm-with/(?P<id>\w+)/$', DMConsumer.as_asgi()),
]
