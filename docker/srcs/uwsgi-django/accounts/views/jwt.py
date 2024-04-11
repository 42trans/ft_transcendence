from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect
from django.http import HttpResponse, JsonResponse


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
        samesite='Lax', # Cookieは現在のウェブサイトからのリクエストでのみ送信
    )
    response.set_cookie(
        'Refresh-Token',
        jwt['refresh'],
        httponly=True,
        secure=True,
        samesite='Lax',
    )
    return response
