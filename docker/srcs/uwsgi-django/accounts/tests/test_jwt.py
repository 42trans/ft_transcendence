from base64 import b32encode
import pyotp

from django.contrib.auth import get_user_model, login
from django.contrib.auth.models import User
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.test import TestCase
from django.urls import reverse, resolve
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.views.two_factor_auth import Verify2FaView


class TokenIssuanceTest(TestCase):
    kLoginName = 'accounts:login'
    kEnable2FaName = "accounts:enable_2fa"
    kUserPageName = "accounts:user"

    kHomeURL = "/pong/"

    kVerify2FaName = "accounts:verify_2fa"
    kVerify2FaURL = "/accounts/verify/verify_2fa/"

    kUserEmail = 'test@example.com'
    kUserNickname = 'test'
    kUserPassword = 'pass012345'

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(email=self.kUserEmail,
                                        nickname=self.kUserNickname,
                                        password=self.kUserPassword,
                                        enable_2fa=False)
        self.user.save()

        self.login_url = reverse(self.kLoginName)
        user_field = {
            'username'  : self.kUserEmail,
            'password'  : self.kUserPassword,
        }
        self.response = self.client.post(self.login_url, user_field)
        self.assertRedirects(self.response, self.kHomeURL)
        self.assertEqual(self.response.status_code, 302)
        self.assertTrue('_auth_user_id' in self.client.session)

    def test_token_issuance_basic_login(self):
        self.assertTrue('Access-Token' in self.response.cookies)
        self.assertTrue('Refresh-Token' in self.response.cookies)

        access_token_cookie = self.response.cookies['Access-Token']
        self.assertTrue(access_token_cookie['httponly'])
        self.assertEqual(access_token_cookie['samesite'], 'Strict')

    def test_token_issuance_2fa(self):
        self._enable_2fa()
        self.client.logout()
        self._login_with_2fa()

        # assert JWT
        self.assertTrue('Access-Token' in self.response.cookies)
        self.assertTrue('Refresh-Token' in self.response.cookies)

        access_token_cookie = self.response.cookies['Access-Token']
        self.assertTrue(access_token_cookie['httponly'])
        self.assertEqual(access_token_cookie['samesite'], 'Strict')

    def _enable_2fa(self):
        enable_2fa_url = reverse(self.kEnable2FaName)
        response = self.client.get(enable_2fa_url)
        secret_key_base32 = response.context['setup_key']
        totp = pyotp.TOTP(secret_key_base32)
        otp_token = totp.now()

        response = self.client.post(enable_2fa_url, {'token': otp_token}, follow=True)

        user_page_url = reverse(self.kUserPageName)
        self.assertRedirects(response, user_page_url)   # succeed enable2fa -> redirect to user
        self.assertTrue('_auth_user_id' in self.client.session)  # login
        self.user.refresh_from_db()
        self.assertTrue(self.user.enable_2fa)  # enable

    def _login_with_2fa(self):
        # login
        user_field = {
            'username'  : self.kUserEmail,
            'password'  : self.kUserPassword,
        }
        response = self.client.post(self.login_url, user_field, follow=True)
        self.assertFalse('_auth_user_id' in self.client.session)  # login yet

        # verify 2fa form
        enable_2fa_view = resolve(self.kVerify2FaURL)
        self.assertEqual(enable_2fa_view.func.view_class, Verify2FaView)

        devices = TOTPDevice.objects.filter(user=self.user, confirmed=True)
        device = devices.first()
        totp = pyotp.TOTP(b32encode(bytes.fromhex(device.key)).decode('utf-8'))
        otp_token = totp.now()

        # verify
        verify_2fa_url = reverse(self.kVerify2FaName)
        response = self.client.post(verify_2fa_url, {'token': otp_token}, follow=True)
        self.assertRedirects(response, self.kHomeURL)
        self.assertIn('_auth_user_id', self.client.session)  # login
