# accounts/middleware.py

import traceback
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.utils.deprecation import MiddlewareMixin
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
import jwt
from accounts.authentication_backend import JWTAuthenticationBackend
from accounts.models import CustomUser


class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        token = request.COOKIES.get('Access-Token')
        if token:
            # JWTをAuthorizationヘッダーに設定
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'

            backend = JWTAuthenticationBackend()
            user = backend.authenticate(request, token=token)
            if user:
                request.user = user


def print_yellow(text):
    print(f"\033[93m[DEBUG] {text}\033[0m")


# WebSocket
class CookieAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using JWT tokens stored in cookies.
    """
    async def __call__(self, scope, receive, send):
        # print_yellow(f"[CookieAuthMiddleware] scope: {scope}")
        headers = dict(scope['headers'])
        token = None

        # クッキーからトークンを検索
        if b'cookie' in headers:
            cookies = headers[b'cookie'].decode()
            token = self.parse_cookie(cookies, 'Access-Token')

        # Authorization ヘッダーからトークンを検索
        elif b'authorization' in headers:
            auth_header = headers[b'authorization'].decode().split()
            if len(auth_header) == 2 and auth_header[0].lower() == 'bearer':
                token = auth_header[1]

        if token:
            # print_yellow(f"[CookieAuthMiddleware] token: {token}")
            user = await self.authenticate_token(token)
            if user:
                scope['user'] = user
            else:
                print_yellow("[CookieAuthMiddleware] Failed to authenticate user with token.")
        else:
            print_yellow("[CookieAuthMiddleware] No valid token found.")

        return await super().__call__(scope, receive, send)


    def parse_cookie(self, cookie_string, name):
        cookies = cookie_string.split(';')
        for cookie in cookies:
            cookie = cookie.strip()
            if cookie.startswith(name + "="):
                token = cookie.split('=')[1]
                return token
        return None


    async def authenticate_token(self, token):
        try:
            # print_yellow(f"authenticate_token 1")
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            # print_yellow(f"authenticate_token 2")
            user_id = payload.get('user_id')
            # print_yellow(f"authenticate_token 3 user_id: {user_id}")
            user = await self.get_user(user_id)  # ユーザー取得を非同期化
            # print_yellow(f"authenticate_token 2: User found: {user}")
            return user

        except jwt.ExpiredSignatureError as e:
            print_yellow("[error] authenticate_token: JWT expired.")
        except jwt.DecodeError as e:
            print_yellow("[error] authenticate_token: JWT decode error.")
        except CustomUser.DoesNotExist as e:
            print_yellow("[error] authenticate_token: User not found.")
        except Exception as e:
            # Exception traceback
            print_yellow(f'[error] authenticate_token: {traceback.format_exc()}')
        return None


    @database_sync_to_async
    def get_user(self, user_id):
        return CustomUser.objects.get(id=user_id)


def CookieAuthMiddlewareStack(inner):
    return CookieAuthMiddleware(AuthMiddlewareStack(inner))
