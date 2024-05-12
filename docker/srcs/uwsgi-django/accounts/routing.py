# accounts/routing.py
from django.urls import re_path
from accounts.online_consumers import OnlineStatusConsumer


websocket_urlpatterns = [
    re_path(r'ws/online/$' , OnlineStatusConsumer.as_asgi()),
]
