# trans_pj/asgi.py
"""
ASGI config for trans_pj project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""
import os
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trans_pj.settings')
django.setup()


from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

from accounts.middleware import CookieAuthMiddlewareStack
import chat.routing
import accounts.routing


application = ProtocolTypeRouter({
    "http": get_asgi_application(),             # route for HTTP: http://
    "websocket": CookieAuthMiddlewareStack(     # route for WebSocket: ws:// wss://
        URLRouter(
            chat.routing.websocket_urlpatterns          # chat/routing.py
            + accounts.routing.websocket_urlpatterns    # accounts/routing.py
        )
    ),

})
