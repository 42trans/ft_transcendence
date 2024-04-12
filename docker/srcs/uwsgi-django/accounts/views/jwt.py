from django.shortcuts import redirect
from django.http import HttpResponse, JsonResponse
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView


def get_jwt_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def response_with_jwt(user, redirect_to: str) -> HttpResponse:
    jwt = get_jwt_for_user(user)
    response = redirect(to=redirect_to)

    # CookieにJWTトークンをセット
    response.set_cookie(
        'Access-Token',
        jwt['access'],
        max_age=3600,   # トークンの有効期限（秒）
        httponly=True,  # JavaScriptからのアクセスを防ぐ -> XSS対策
        secure=True,    # HTTPSを通じてのみCookieを送信
        samesite='None', # Cookieは現在のウェブサイトからのリクエストでのみ送信
    )
    response.set_cookie(
        'Refresh-Token',
        jwt['refresh'],
        max_age=3600,   # トークンの有効期限（秒）
        httponly=True,  # JavaScriptからのアクセスを防ぐ -> XSS対策
        secure=True,    # HTTPSを通じてのみCookieを送信
        samesite='None', # Cookieは現在のウェブサイトからのリクエストでのみ送信
    )
    return response


def get_jwt_response(user, data) -> JsonResponse:
    jwt = get_jwt_for_user(user)
    response = JsonResponse(data, status=200)

    response.set_cookie(
        'Access-Token',
        jwt['access'],
        max_age=3600,   # トークンの有効期限（秒）
        httponly=True,  # JavaScriptからのアクセスを防ぐ -> XSS対策
        secure=True,    # HTTPSを通じてのみCookieを送信
        samesite='None', # Cookieは現在のウェブサイトからのリクエストでのみ送信
    )
    response.set_cookie(
        'Refresh-Token',
        jwt['refresh'],
        max_age=3600,   # トークンの有効期限（秒）
        httponly=True,  # JavaScriptからのアクセスを防ぐ -> XSS対策
        secure=True,    # HTTPSを通じてのみCookieを送信
        samesite='None', # Cookieは現在のウェブサイトからのリクエストでのみ送信
    )
    return response


def is_valid_jwt(request) -> bool:
    try:
        # JWTトークンを検証
        user_auth = JWTAuthentication().authenticate(request)
        return user_auth is not None
    except InvalidToken:
        # トークンが無効または期限切れ
        return false


class JWTAuthenticationView(APIView):
    """
    user authentication
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        user = authenticate(username=request.data['username'],
                            password=request.data['password'])
        if user is None:
            data = {
                'error': 'Invalid credentials'
            }
            return Response(data, status=400)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
