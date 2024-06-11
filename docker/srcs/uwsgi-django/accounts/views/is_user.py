# accounts/views/is_user.py

from django.conf import settings
from django.http import JsonResponse
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView


class IsUserLoggedInAPIView(APIView):
    """
    APIを叩いたuserのlogin状態を返す
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs) -> JsonResponse:
        data = {
            'is_logged_in': request.user.is_authenticated
        }
        return JsonResponse(data, status=200)


class IsUserEnabled2FaAPIView(APIView):
    """
    APIを叩いたuserのenable2faを返す
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs) -> JsonResponse:
        if not request.user.is_authenticated:
            # 401回避のため Faleを返す
            enable2fa = False
        else:
            enable2fa = request.user.enable_2fa
        data = {
            'is_enable2fa': enable2fa
        }
        return JsonResponse(data, status=200)
