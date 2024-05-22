# docker/srcs/uwsgi-django/pong/routing.py
from django.urls import path
from .online.pong_online_consumer import PongOnlineConsumer

websocket_urlpatterns = [
    path('ws/pong/online/', PongOnlineConsumer.as_asgi()),
    # path('ws/pong/online/<game_mode>/', PongOnlineConsumer.as_asgi()),
]
