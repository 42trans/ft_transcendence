# docker/srcs/uwsgi-django/pong/routing.py
from django.urls import path, re_path
from .online.pong_online_consumer import PongOnlineConsumer
from .online.duel.pong_online_duel_consumer import PongOnlineDuelConsumer

websocket_urlpatterns = [
	re_path(r'ws/pong/online/duel/duel-with/(?P<nickname>\w+)/$', PongOnlineDuelConsumer.as_asgi()),
	path('ws/pong/online/', PongOnlineConsumer.as_asgi()),
	# path('ws/pong/online/<game_mode>/', PongOnlineConsumer.as_asgi()),
]
