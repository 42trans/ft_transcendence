"""
ASGI config for trans_pj project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.security.websocket import AllowedHostsOriginValidator
import chat.routing


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trans_pj.settings')
django_asgi_app = get_asgi_application()


application = ProtocolTypeRouter({
    "http": django_asgi_app,            # route for HTTP: http://
    "websocket": AuthMiddlewareStack(   # route for WebSocket: ws:// wss://
        URLRouter(
            chat.routing.websocket_urlpatterns  # chat/routing.py
        )
    ),
})
