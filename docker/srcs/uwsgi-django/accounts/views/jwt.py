from django.shortcuts import redirect
from django.http import HttpResponse, JsonResponse
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.views import APIView

def get_jwt_for_user(user):
    refresh = RefreshToken.for_user(user)
    data = {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
    return data


def set_to_cookie(jwt,
                  response,
                  max_age_sec: int = 3600,
                  http_only: bool = True,
                  secure: bool = True,
                  samesite: str = "Strict"):
    response.set_cookie(
        'Access-Token',
        jwt['access'],
        max_age=max_age_sec,# トークンの有効期限（秒）
        httponly=http_only, # JavaScriptからのアクセスを防ぐ -> XSS対策
        secure=secure,      # HTTPSを通じてのみCookieを送信
        samesite=samesite,  # Cookieは現在のウェブサイトからのリクエストでのみ送信
    )

    if jwt.get('refresh'):
        response.set_cookie(
            'Refresh-Token',
            jwt['refresh'],
            max_age=max_age_sec,# トークンの有効期限（秒）
            httponly=http_only, # JavaScriptからのアクセスを防ぐ -> XSS対策
            secure=secure,      # HTTPSを通じてのみCookieを送信
            samesite=samesite,  # Cookieは現在のウェブサイトからのリクエストでのみ送信
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


class JWTRefreshView(TokenRefreshView):
    """
    Receive a refresh token in the POST request
    return the new access token and the refresh token
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs) -> JsonResponse:
        serializer = TokenRefreshSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
        except Exception as e:
            data = {'error': str(e)}
            return JsonResponse(data, status=401)

        new_access_token = data['access']
        new_refresh_token = data.get('refresh', None)

        refresh_jwt = {
            'access': str(new_access_token),
            'refresh': str(new_refresh_token) if new_refresh_token else None,
        }
        data = {'message': 'Token refreshed successfully'}
        response = JsonResponse(data, status=200)
        set_to_cookie(refresh_jwt, response)
        return response
