# accounts/middleware.py

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.utils.deprecation import MiddlewareMixin
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
import jwt
from accounts.authentication_backend import JWTAuthenticationBackend


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
        print_yellow("CookieAuthMiddleware call 1")  # デバッグ情報
        print_yellow(f"scope:{scope}")  # デバッグ情報
        headers = dict(scope['headers'])
        print_yellow("call 2")  # デバッグ情報
        if b'cookie' in headers:
            print_yellow("call 3")  # デバッグ情報
            cookies = headers[b'cookie'].decode()
            print_yellow("call 4")  # デバッグ情報
            token = self.parse_cookie(cookies, 'Access-Token')
            print_yellow(f"call 5 token: {token}")  # デバッグ情報

            if token:
                print_yellow(f"call 6: Token found in cookies: {token}")  # デバッグ情報
                try:
                    user = await self.authenticate_token(token)
                    if user:
                        print_yellow(f"call 7: User authenticated: {user}")
                        scope['user'] = user
                    else:
                        print_yellow("call 8: Failed to authenticate user with token.")
                except Exception as e:
                    print_yellow(f"call 8: Exception in authenticate_token: {str(e)}")
                    print_yellow(traceback.format_exc())  # This will print the traceback of the exception
            else:
                print_yellow("call 9: No token found in cookies.")  # デバッグ情報

        print_yellow("call 10")  # デバッグ情報
        return await super().__call__(scope, receive, send)


    def parse_cookie(self, cookie_string, name):
        print_yellow(f"parse_cookie 1: Analyzing cookies: {cookie_string}")  # 受け取ったクッキー全体の出力
        cookies = cookie_string.split(';')
        for cookie in cookies:
            cookie = cookie.strip()
            print_yellow(f"parse_cookie 2: Checking cookie: {cookie}")  # 各クッキー項目のチェック
            if cookie.startswith(name + "="):
                token = cookie.split('=')[1]
                print_yellow(f"parse_cookie 3: Token extracted: {token}")  # トークン抽出の確認
                return token
        print_yellow("parse_cookie 4: Token not found in cookies.")  # トークンが見つからない場合のログ
        return None


    async def authenticate_token(self, token):
        print_yellow(f"authenticate_token 1")
        User = get_user_model()
        print_yellow(f"authenticate_token 2")
        try:
            print_yellow(f"authenticate_token 3")
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            print_yellow(f"authenticate_token 4")
            user_id = payload.get('user_id')
            print_yellow(f"authenticate_token 5")
            user = await self.get_user(user_id)  # ユーザー取得を非同期化
            # user = await User.objects.get(id=payload['user_id'])
            print_yellow(f"authenticate_token 6: User found: {user}")
            return user

        except jwt.ExpiredSignatureError as e:
            print_yellow("authenticate_token 7: JWT expired.")
        except jwt.DecodeError as e:
            print_yellow("authenticate_token 8: JWT decode error.")
        except User.DoesNotExist as e:
            print_yellow("authenticate_token 9: User not found.")
        except Exception as e:
            print_yellow(f"authenticate_token 10: Other error: {str(e)}")
            print_yellow(traceback.format_exc())  # Exception traceback
        return None


    @database_sync_to_async
    def get_user(self, user_id):
        User = get_user_model()
        return User.objects.get(id=user_id)


def CookieAuthMiddlewareStack(inner):
    return CookieAuthMiddleware(AuthMiddlewareStack(inner))
