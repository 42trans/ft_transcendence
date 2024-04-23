# chat/routing.py
from django.urls import re_path
from chat.consumers import ChatConsumer
from chat.dm_consumers import DMConsumer


websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),
    # re_path(r'ws/dm/(?P<sender>\w+)/(?P<nickname>\w+)/$', DMConsumer.as_asgi()),
    re_path(r'ws/dm/(?P<nickname>\w+)/$', DMConsumer.as_asgi()),
]
