from base64 import b64encode, b32encode, b32decode, b64decode
from binascii import hexlify, unhexlify
from datetime import datetime, timedelta, timezone
from io import BytesIO
import pyotp
import qrcode
import time

from django import forms
from django.contrib.auth import get_user_model, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django_otp import devices_for_user
from django_otp.oath import TOTP
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.util import random_hex
from django.utils.decorators import method_decorator
from django.utils.timezone import make_aware
from django.shortcuts import render, redirect
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated

from accounts.forms import Enable2FAForm, Verify2FAForm
from accounts.models import CustomUser, UserManager
from accounts.views.jwt import get_jwt_response


class Enable2FaTemplateView(TemplateView):
    template_name = 'verify/enable_2fa.html'
    login_path = "accounts:login"
    user_page_path = "accounts:user"

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(to=self.login_path)

        if request.user.enable_2fa:
            return redirect(to=self.user_page_path)

        return render(request, self.template_name)


class Enable2FaAPIView(APIView):
    permission_classes = [IsAuthenticated]

    template_name = 'verify/enable_2fa.html'
    enabled_redirect_to = '/user-profile/'
    authenticated_redirect_to = "/game/"

    def get(self, request, *args, **kwargs):
        if request.user.enable_2fa:
            data = {
                "message": "Already enabled 2FA",
                "redirect": self.authenticated_redirect_to,
            }
        else:
            secret_key, secret_key_base32 = self._get_secret_key(request)
            qr_code_data, _ = self._generate_qr_code(secret_key_base32,
                                                     request.user.get_username())
            data = {
                'qr_code_data': qr_code_data,
                'setup_key': secret_key_base32,
            }
        return JsonResponse(data, status=200)

    def post(self, request, *args, **kwargs):
        if request.user.enable_2fa:
            data = {
                "message": "Already enabled 2FA",
                "redirect": self.authenticated_redirect_to,
            }
            return JsonResponse(data, status=200)

        token = request.data.get('token')
        secret_key, secret_key_base32 = self._get_secret_key(request)
        totp = pyotp.TOTP(secret_key_base32)

        if totp.verify(token):
            self._enable_user_2fa(request.user)
            self._register_device(request.user, secret_key, totp)
            del request.session['enable_2fa_temp_secret_info']
            data = {
                "message": "2FA has been enabled successfully",
                "redirect": self.enabled_redirect_to,
            }
            return JsonResponse(data, status=200)
        else:
            data = {"error": "Invalid token provided"}
            return JsonResponse(data, status=400)

    def _get_secret_key(self, request):
        """
        OTP用の秘密鍵を生成する
        GET, POSTで同じ秘密鍵を参照できるよう、Sessionに保存する
        OTPを登録せずに離脱した場合、次回アクセス時に秘密鍵が再利用されないよう、有効期限を1分とする
        """
        now = make_aware(datetime.now())
        secret_info = request.session.get('enable_2fa_temp_secret_info')

        if secret_info:
            secret_key = secret_info['key']
            timestamp = datetime.fromtimestamp(secret_info['timestamp'], tz=timezone.utc)
            if request.method == 'POST' or now <= timestamp + timedelta(minutes=1):
                secret_key_base32 = b32encode(bytes.fromhex(secret_key)).decode('utf-8')
                return secret_key, secret_key_base32

        secret_key = random_hex(20)
        secret_key_base32 = b32encode(bytes.fromhex(secret_key)).decode('utf-8')

        request.session['enable_2fa_temp_secret_info'] = {
            'key': secret_key,
            'timestamp': int(now.timestamp())
        }
        return secret_key, secret_key_base32

    def _generate_qr_code(self, secret_key_base32, username):
        totp = pyotp.TOTP(secret_key_base32)
        uri = totp.provisioning_uri(username, issuer_name="pong")

        qr = qrcode.QRCode(
            box_size=6,
            border=3,
        )
        qr.add_data(uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")

        io = BytesIO()
        img.save(io)
        qr_code_data = b64encode(io.getvalue()).decode('utf-8')
        return qr_code_data, totp

    def _register_device(self, user, secret_key, totp):
        device, created = TOTPDevice.objects.get_or_create(
            user=user,
            defaults={
                'key': secret_key,
                'step': totp.interval,
                'name': 'default',
                'confirmed': True
            })
        if not created:
            device.key = secret_key
            device.step = totp.interval
            device.name = 'default'
            device.confirmed = True
            device.save()

    def _enable_user_2fa(self, user):
        user.enable_2fa = True
        user.save()


# @method_decorator(csrf_exempt, name='dispatch')  # todo: 一時的に無効化
class Disable2FaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print("disable_2fa 1")
        user = request.user

        if not user.enable_2fa:
            data = {
                'message': 'No valid 2FA session',
                'redirect': '/user-profile/',
            }
            return Response(data, status=400)

        self._delete_totp_devices(user)
        self._disable_user_2fa(user)
        data = {
            'message': '2FA disable successful',
            'redirect': '/user-profile/',
        }
        return Response(data, status=200)

    def _delete_totp_devices(self, user):
        devices = TOTPDevice.objects.filter(user=user, confirmed=True)
        for device in devices:
            device.delete()

    def _disable_user_2fa(self, user):
        user.enable_2fa = False
        user.save()


class Verify2FaTepmlateView(TemplateView):
    template_name = 'verify/verify_2fa.html'
    login_page_path = 'accounts:login'

    def dispatch(self, request, *args, **kwargs):
        user, _ = Verify2FaAPIView._get_user_and_devices(request)
        if user is None:
            return redirect(self.login_page_path)
        return super().dispatch(request, *args, **kwargs)


class Verify2FaAPIView(APIView):
    permission_classes = [AllowAny]  # Non-Login before verify 2FA

    def post(self, request, *args, **kwargs):
        user, devices = self._get_user_and_devices(request)
        if user is None:
            data = {
                'error': 'No valid session found',
                'redirect': '/login/',
            }
            return Response(data, status=401)

        token = request.data.get('token')
        for device in devices:
            if device.verify_token(token):
                # login(request, user)  # JWT auth -> login() unused
                del request.session['tmp_auth_user_id']
                data = {
                    'message'   : '2FA verification successful',
                    'redirect'  : '/user-profile/',
                }
                return get_jwt_response(user, data)

        data = {'error': 'Invalid token'}
        return Response(data, status=400)

    @classmethod
    def _get_user_and_devices(self, request):
        tmp_user_id = request.session.get('tmp_auth_user_id')

        if tmp_user_id is None:
            user = None
            devices = []
        else:
            User = get_user_model()
            try:
                user = User.objects.get(id=tmp_user_id)
                devices = list(devices_for_user(user, confirmed=True))
            except User.DoesNotExist:
                user = None
                devices = []
        return user, devices
