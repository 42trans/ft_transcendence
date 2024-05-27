# docker/srcs/uwsgi-django/pong/routing.py
from django.urls import path, re_path
from .online.pong_online_consumer import PongOnlineConsumer
from .online.duel.pong_online_duel_consumer import PongOnlineDuelConsumer

websocket_urlpatterns = [
	re_path(r'ws/pong/online/duel/(?P<room_name>\w+)/$', PongOnlineDuelConsumer.as_asgi()),
	path('ws/pong/online/', PongOnlineConsumer.as_asgi()),
]
