# chat/routing.py　=> pong/
# from django.urls import re_path
from django.urls import path
from .online.pong_online_consumer import PongOnlineConsumer


websocket_urlpatterns = [
    path('ws/pong/online/', PongOnlineConsumer.as_asgi()),
    # path('ws/pong/online/<game_mode>/', PongOnlineConsumer.as_asgi()),
    # re_path(r'ws/dm-with/(?P<nickname>\w+)/$', DMConsumer.as_asgi()),
]
