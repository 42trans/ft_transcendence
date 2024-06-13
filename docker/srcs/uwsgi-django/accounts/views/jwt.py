from datetime import datetime, timedelta
from django.conf import settings
from django.shortcuts import redirect
from django.http import HttpResponse, JsonResponse
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.views import APIView
import logging

logger = logging.getLogger('accounts')


def get_jwt_for_user(user):
    refresh = RefreshToken.for_user(user)
    data = {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
    return data


def set_to_cookie(jwt,
                  response,
                  http_only: bool = True,
                  secure: bool = True,
                  samesite: str = "Strict"):

    access_token_lifetime = settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME', timedelta(hours=1))
    refresh_token_lifetime = settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME', timedelta(hours=6))

    response.set_cookie(
        'Access-Token',
        jwt['access'],
        max_age=int(access_token_lifetime.total_seconds()),  # トークンの有効期限（秒）
        httponly=http_only,  # JavaScriptからのアクセスを防ぐ -> XSS対策
        secure=secure,       # HTTPSを通じてのみCookieを送信
        samesite=samesite,   # Cookieは現在のウェブサイトからのリクエストでのみ送信
    )

    response.set_cookie(
        'Refresh-Token',
        jwt['refresh'],
        max_age=int(refresh_token_lifetime.total_seconds()),  # トークンの有効期限（秒）
        httponly=http_only,  # JavaScriptからのアクセスを防ぐ -> XSS対策
        secure=secure,       # HTTPSを通じてのみCookieを送信
        samesite=samesite,   # Cookieは現在のウェブサイトからのリクエストでのみ送信
    )


def set_jwt_to_cookie(user, response):
    jwt = get_jwt_for_user(user)
    set_to_cookie(jwt, response)


def get_jwt_response(user, data) -> JsonResponse:
    response = JsonResponse(data, status=200)
    set_jwt_to_cookie(user, response)
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

    def post(self, request, *args, **kwargs) -> JsonResponse:
        user = authenticate(username=request.data['username'],
                            password=request.data['password'])
        if user is None:
            data = {'error': 'Invalid credentials'}
            return JsonResponse(data, status=401)

        data = {'message': 'Authentication successful'}
        return get_jwt_response(user, data, status=200)


class JWTRefreshAPIView(TokenRefreshView):
    """
    Receive a refresh token in the POST request
    return the new access token and the refresh token
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs) -> JsonResponse:
        current_access_token = request.COOKIES.get('Access-Token')  # Cookieからaccess-tokenを取得
        current_refresh_token = request.COOKIES.get('Refresh-Token')  # Cookieからrefresh-tokenを取得

        # アクセストークンの有効期限が切れていない場合は、そのままレスポンスを返す
        if self.__is_valid_access_token(current_access_token):
            data = {'message': 'Access token is still valid'}
            response = JsonResponse(data, status=200)
            if settings.DEBUG: logger.error(f"{data['message']}")
            return response

        if current_refresh_token is None:
            data = {'error': 'Refresh token not found'}
            if settings.DEBUG: logger.error(f"{data['error']}")
            return JsonResponse(data, status=401)

        try:
            serializer = TokenRefreshSerializer(data={'refresh': current_refresh_token})
            serializer.is_valid(raise_exception=True)
            new_data = serializer.validated_data

            new_access_token = AccessToken(new_data['access'])
            new_refresh_token = RefreshToken(new_data['refresh'])

            # 有効期限を設定
            new_access_token.set_exp(lifetime=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'])
            new_refresh_token.set_exp(lifetime=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'])
            self.__print_expire(new_access_token, new_refresh_token)

            refresh_jwt = {
                'access': str(new_access_token),
                'refresh': str(new_refresh_token),
            }

            data = {'message': 'Token refreshed successfully'}
            response = JsonResponse(data, status=200)
            set_to_cookie(refresh_jwt, response)
            return response

        except Exception as e:
            data = {'error': str(e)}
            if settings.DEBUG: logger.error(f"error: {data['error']}")
            return JsonResponse(data, status=401)

    def __is_valid_access_token(self, current_access_token):
        if current_access_token is None:
            return False

        try:
            token = AccessToken(current_access_token)
            return datetime.utcnow().timestamp() < token.payload['exp']

        except Exception:
            return False

    def __print_expire(self, new_access_token, new_refresh_token):
        # 有効期限の延長を確認 ################################################
        if settings.DEBUG:
            new_access_token_expiry = new_access_token.payload['exp']
            new_refresh_token_expiry = new_refresh_token.payload['exp']

            logger.error(f"{'-' * 60}")
            logger.error(f"[Update]")
            logger.error(f" Access  Token Expiry: {datetime.fromtimestamp(new_access_token_expiry)}")
            logger.error(f" Refresh Token Expiry: {datetime.fromtimestamp(new_refresh_token_expiry)}")
            logger.error(f"{'-' * 60}")
        ####################################################################
