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
from django_otp import devices_for_user
from django_otp.oath import TOTP
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.util import random_hex
from django.utils.timezone import make_aware
from django.shortcuts import render, redirect
from django.views import View

from accounts.forms import Enable2FAForm, Verify2FAForm
from accounts.models import CustomUser, UserManager
from accounts.views.jwt import response_with_jwt


class Enable2FaView(LoginRequiredMixin, View):
    template_name = 'verify/enable_2fa.html'
    user_page_path = 'accounts:user'

    def get(self, request, *args, **kwargs):
        if request.user.enable_2fa:
            return redirect(to=self.user_page_path)

        form = Enable2FAForm()
        secret_key, secret_key_base32 = self._get_secret_key(request)
        qr_code_data, _ = self._generate_qr_code(secret_key_base32, request.user.get_username())
        param = {
            'qr_code_data': qr_code_data,
            'setup_key': secret_key_base32,
            'form': form
        }
        return render(request, self.template_name, param)

    def post(self, request, *args, **kwargs):
        if request.user.enable_2fa:
            return redirect(to=self.user_page_path)

        secret_key, secret_key_base32 = self._get_secret_key(request)
        qr_code_data, totp = self._generate_qr_code(secret_key_base32, request.user.get_username())
        form = Enable2FAForm(request.POST, totp=totp)
        if form.is_valid():
            user = request.user
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

            del request.session['enable_2fa_temp_secret_info']
            self._enable_user_2fa(user)
            return redirect(to=self.user_page_path)
        else:
            param = {
                'qr_code_data': qr_code_data,
                'setup_key': secret_key_base32,
                'form': form
            }
            return render(request, self.template_name, param)

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

    def _enable_user_2fa(self, user):
        user.enable_2fa = True
        user.save()


class Disable2FaView(LoginRequiredMixin, View):
    redirect_to = 'accounts:user'

    def get(self, request, *args, **kwargs):
        user = request.user
        self._delete_totp_devices(user)
        self._disable_user_2fa(user)
        return redirect(to=self.redirect_to)

    def _delete_totp_devices(self, user):
        devices = TOTPDevice.objects.filter(user=user, confirmed=True)
        for device in devices:
            device.delete()

    def _disable_user_2fa(self, user):
        user.enable_2fa = False
        user.save()


class Verify2FaView(View):
    template_name = 'verify/verify_2fa.html'
    login_page_path = 'accounts:login'
    authenticated_redirect_to = "/pong/"

    def get(self, request, *args, **kwargs):
        form = Verify2FAForm()
        user, _ = self._get_user_and_devices(request)

        if user is None or user.enable_2fa is False:
            return redirect(to=self.login_page_path)

        param = {
            'form': form,
        }
        return render(request, self.template_name, param)

    def post(self, request, *args, **kwargs):
        user, devices = self._get_user_and_devices(request)
        if user is None or user.enable_2fa is False:
            return redirect(to=self.login_page_path)

        form = Verify2FAForm(request.POST, devices=devices)
        if form.is_valid():
            login(request, user)
            del request.session['temp_auth_user_id']
            return response_with_jwt(user, self.authenticated_redirect_to)

        else:
            form.add_error(None, 'Invalid token')
            param = {
                'form': form,
            }
            return render(request, self.template_name, param)

    def _get_user_and_devices(self, request):
        temp_user_id = request.session.get('temp_auth_user_id')
        if temp_user_id is None:
            user = None
            devices = []
        else:
            User = get_user_model()
            try:
                user = User.objects.get(id=temp_user_id)
                devices = list(devices_for_user(user, confirmed=True))
            except User.DoesNotExist:
                user = None
                devices = []
        return user, devices
