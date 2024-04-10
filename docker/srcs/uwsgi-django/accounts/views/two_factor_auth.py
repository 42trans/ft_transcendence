from base64 import b64encode, b32encode, b32decode, b64decode
from binascii import hexlify, unhexlify
from io import BytesIO
import pyotp
import qrcode

from django import forms
from django.contrib.auth import get_user_model, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django_otp import devices_for_user
from django_otp.oath import TOTP
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.util import random_hex
from django.shortcuts import render, redirect
from django.views import View

from accounts.forms import Enable2FAForm, Verify2FAForm
from accounts.models import CustomUser, UserManager


class Enable2FaView(LoginRequiredMixin, View):
    template_name = 'verify/enable_2fa.html'
    user_page_path = 'accounts:user'

    def get(self, request, *args, **kwargs):
        form = Enable2FAForm()
        secret_key = self._get_secret_key(request)
        qr_code_data, _ = self._generate_qr_code(secret_key, request.user.get_username())
        param = {
            'qr_code_data': qr_code_data,
            'form': form
        }
        return render(request, self.template_name, param)

    def post(self, request, *args, **kwargs):
        form = Enable2FAForm(request.POST)
        secret_key = self._get_secret_key(request)
        qr_code_data, totp = self._generate_qr_code(secret_key, request.user.get_username())
        if form.is_valid():
            token = form.cleaned_data['token']
            if not totp.verify(token):
                form.add_error(None, 'Invalid token')
            else:
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

                del request.session['enable_2fa_temp_secret']
                self._enable_user_2fa(user)
                return redirect(to=self.user_page_path)
        param = {
            'qr_code_data': qr_code_data,
            'form': form
        }
        return render(request, self.template_name, param)

    def _get_secret_key(self, request):
        secret_key = request.session.get('enable_2fa_temp_secret')
        if secret_key is None:
            secret_key = random_hex(20)
            request.session['enable_2fa_temp_secret'] = secret_key
        return secret_key

    def _generate_qr_code(self, secret_key, username):
        secret_key_base32 = b32encode(bytes.fromhex(secret_key)).decode('utf-8')
        totp = pyotp.TOTP(secret_key_base32)
        uri = totp.provisioning_uri(username, issuer_name="pong")
        qr = qrcode.make(uri)
        io = BytesIO()
        qr.save(io)
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
    authenticated_redirect_to = "/pong/"

    def get(self, request, *args, **kwargs):
        form = Verify2FAForm()
        user, _ = self._get_user_and_devices(request)
        param = {
            'form': form,
        }
        return render(request, self.template_name, param)

    def post(self, request, *args, **kwargs):
        form = Verify2FAForm(request.POST)
        user, devices = self._get_user_and_devices(request)
        if form.is_valid():
            token = form.cleaned_data['token']
            for device in devices:
                if device.verify_token(token):
                    login(request, user)
                    del request.session['temp_auth_user_id']
                    return redirect(to=self.authenticated_redirect_to)
            form.add_error(None, 'Invalid token')

        param = {
            'form': form,
        }
        return render(request, self.template_name, param)

    def _get_user_and_devices(self, request):
        temp_user_id = request.session.get('temp_auth_user_id')
        if temp_user_id is not None:
            User = get_user_model()
            try:
                user = User.objects.get(id=temp_user_id)
                devices = list(devices_for_user(user, confirmed=True))
            except User.DoesNotExist:
                user = None
                devices = []
        else:
            user = None
            devices = []
        return user, devices
