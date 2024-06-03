import os
from base64 import b32encode
import pyotp
import time

from django.conf import settings
from django.contrib.auth import get_user_model, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.messages import get_messages
from django.http import JsonResponse
from django_otp.util import random_hex
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.test import TestCase
from django.urls import reverse, resolve
from rest_framework import status
from rest_framework.test import APIClient


class Enable2FaAPITests(TestCase):
    kUserEmail = 'test@example.com'
    kUserNickname = 'test'
    kUserPassword = 'pass01234'

    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"
    kEnable2FaAPIName = "api_accounts:api_enable_2fa"

    def setUp(self):
        self.enable_2fa_api_url = reverse(self.kEnable2FaAPIName)
        self.login_api_path = reverse(self.kLoginAPIName)
        self.client = APIClient()

        User = get_user_model()
        self.user = User.objects.create_user(email=self.kUserEmail,
                                             nickname=self.kUserNickname,
                                             password=self.kUserPassword,
                                             enable_2fa=False)  # disable
        self.user.save()
        self._login()

    # get
    def test_get_enabled_user(self):
        self.user.enable_2fa = True
        self.user.save()
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.enable_2fa_api_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Already enabled 2FA", response.json()['message'])
        self.assertIn(settings.URL_CONFIG['kSpaPongTopUrl'], response.json()['redirect'])

    def test_get_disable_user(self):
        response = self.client.get(self.enable_2fa_api_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('qr_code_data', response.json())
        self.assertIn('setup_key', response.json())

    def test_get_un_login_user(self):
        self._logout()

        response = self.client.get(self.enable_2fa_api_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # post
    def test_post_enabled_user(self):
        self.user.enable_2fa = True
        self.user.save()
        self.client.force_authenticate(user=self.user)

        response = self.client.post(self.enable_2fa_api_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Already enabled 2FA", response.json()['message'])
        self.assertIn(settings.URL_CONFIG['kSpaPongTopUrl'], response.json()['redirect'])

    def test_post_succeed_enable_2fa(self):
        self.user.refresh_from_db()
        self.assertFalse(self.user.enable_2fa)  # disable

        response = self.client.get(self.enable_2fa_api_url)
        secret_key_base32 = response.json()['setup_key']
        totp = pyotp.TOTP(secret_key_base32)
        otp_token = totp.now()

        response = self.client.post(self.enable_2fa_api_url, {'token': otp_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("2FA has been enabled successfully", response.json()['message'])
        self.assertIn(settings.URL_CONFIG['kSpaPongTopUrl'], response.json()['redirect'])

        self.user.refresh_from_db()
        self.assertTrue(self.user.enable_2fa)  # enable

    def test_post_invalid_token1(self):
        response = self.client.post(self.enable_2fa_api_url, {'token': '012345'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid token provided", response.json()['error'])

        self.user.refresh_from_db()
        self.assertFalse(self.user.enable_2fa)  # disable

    def test_post_invalid_token2(self):
        response = self.client.post(self.enable_2fa_api_url, {'token': ''})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid token provided", response.json()['error'])

        self.user.refresh_from_db()
        self.assertFalse(self.user.enable_2fa)  # disable

    def test_post_invalid_token3(self):
        response = self.client.post(self.enable_2fa_api_url, {'token': 'abc'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid token provided", response.json()['error'])

        self.user.refresh_from_db()
        self.assertFalse(self.user.enable_2fa)  # disable

    def test_post_empty_token(self):
        response = self.client.post(self.enable_2fa_api_url, {'token': ''})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid token provided', response.json()['error'])

        self.user.refresh_from_db()
        self.assertFalse(self.user.enable_2fa)  # disable

    def test_post_empty_request(self):
        response = self.client.post(self.enable_2fa_api_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid token provided', response.json()['error'])

        self.user.refresh_from_db()
        self.assertFalse(self.user.enable_2fa)  # disable

    def test_post_un_login_user(self):
        self._logout()

        response = self.client.post(self.enable_2fa_api_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # other
    def test_secret_key_regeneration(self):
        response1 = self.client.get(self.enable_2fa_api_url)
        secret_key1 = response1.json()['setup_key']

        response2 = self.client.get(self.enable_2fa_api_url)
        secret_key2 = response2.json()['setup_key']

        self.assertEqual(secret_key1, secret_key2, "同一の秘密鍵が生成される")

        self._logout()
        self._login()
        response3 = self.client.get(self.enable_2fa_api_url)
        secret_key3 = response3.json()['setup_key']

        self.assertNotEqual(secret_key1, secret_key3, "新しい秘密鍵が生成される")

    # helper
    def _login(self):
        login_data = {
            'email': self.kUserEmail,
            'password': self.kUserPassword
        }
        self.client.post(self.login_api_path, data=login_data)

    def _logout(self):
        logout_api_url = reverse(self.kLogoutAPIName)
        self.client.get(logout_api_url)


class Verify2FaAPITests(TestCase):
    kUserEmail = 'test@example.com'
    kUserNickname = 'test'
    kUserPassword = 'pass01234'

    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"
    kEnable2FaAPIName = "api_accounts:api_enable_2fa"
    kVerify2FaAPIName = "api_accounts:api_verify_2fa"

    def setUp(self):
        self.login_api_path = reverse(self.kLoginAPIName)
        self.logout_api_url = reverse(self.kLogoutAPIName)
        self.enable_2fa_api_url = reverse(self.kEnable2FaAPIName)
        self.verify_2fa_api_url = reverse(self.kVerify2FaAPIName)

        self.client = APIClient()

        User = get_user_model()
        self.user = User.objects.create_user(email=self.kUserEmail,
                                             nickname=self.kUserNickname,
                                             password=self.kUserPassword,
                                             enable_2fa=False)  # disable
        self.user.save()
        self._login()
        response = self.client.get(self.enable_2fa_api_url)
        secret_key_base32 = response.json()['setup_key']
        totp = pyotp.TOTP(secret_key_base32)
        self.otp_token = totp.now()

        response = self.client.post(self.enable_2fa_api_url, {'token': self.otp_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.client.get(self.logout_api_url)

    def test_success_verify_2fa(self):
        self._login()

        response = self.client.post(self.verify_2fa_api_url, {'token': self.otp_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("2FA verification successful", response.json()['message'])
        self.assertIn(settings.URL_CONFIG['kSpaPongTopUrl'], response.json()['redirect'])

        self.assertIn('Access-Token', response.cookies)
        self.assertIn('Refresh-Token', response.cookies)
        self.assertNotEqual(response.cookies['Access-Token'].value, '')
        self.assertNotEqual(response.cookies['Refresh-Token'].value, '')

    def test_faulure_invalid_token(self):
        self._login()

        response = self.client.post(self.verify_2fa_api_url, {'token': '012345'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid token', response.json()['error'])

    def test_faulure_empty_token(self):
        self._login()

        response = self.client.post(self.verify_2fa_api_url, {'token': ''})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid token', response.json()['error'])

    def test_faulure_empty_request(self):
        self._login()

        response = self.client.post(self.verify_2fa_api_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid token', response.json()['error'])

    def test_un_login_user(self):
        response = self.client.post(self.verify_2fa_api_url, {'token': '012345'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('No valid session found', response.json()['error'])
        self.assertIn(settings.URL_CONFIG['kSpaAuthLoginUrl'], response.json()['redirect'])

    # helper
    def _login(self):
        self.login_data = {
            'email': self.kUserEmail,
            'password': self.kUserPassword
        }
        self.client.post(self.login_api_path, data=self.login_data)
