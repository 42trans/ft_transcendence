from base64 import b32encode
import pyotp

from django.contrib.auth import get_user_model, login
from django.contrib.auth.models import User
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.test import TestCase
from django.urls import reverse, resolve
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


class JWTTest(APITestCase):
    kUserEmail = 'test@example.com'
    kUserNickname = 'test'
    kUserPassword = 'pass01234'

    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"
    kEnable2FaAPIName = "api_accounts:api_enable_2fa"
    kVerify2FaAPIName = "api_accounts:api_verify_2fa"
    kTokenRefreshAPIName = "api_accounts:api_token_refresh"

    def setUp(self):
        self.enable_2fa_api_url = reverse(self.kEnable2FaAPIName)
        self.verify_2fa_api_url = reverse(self.kVerify2FaAPIName)
        self.login_api_path = reverse(self.kLoginAPIName)
        self.token_refresh_api_url = reverse(self.kTokenRefreshAPIName)
        self.client = APIClient()

        User = get_user_model()
        self.user = User.objects.create_user(email=self.kUserEmail,
                                             nickname=self.kUserNickname,
                                             password=self.kUserPassword,
                                             enable_2fa=False)  # disable
        self.user.save()

    def test_token_issuance_basic_login(self):
        response = self._basic_login()
        self._assert_jwt_in_cookie(response)

    def test_token_issuance_2fa(self):
        self._basic_login()
        self._enable_2fa()
        self.client.logout()
        response = self._login_with_2fa()

        self._assert_jwt_in_cookie(response)

    def test_refresh_token(self):
        response = self._basic_login()
        response = self.client.post(self.token_refresh_api_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['message'], 'Access token is still valid')

    def test_refresh_token_with_invalid_token(self):
        self.client.cookies['Refresh-Token'] = 'invalidtoken1234567890'

        response = self.client.post(self.token_refresh_api_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.json())
        self.assertEqual(response.json()['error'], 'Token is invalid or expired')

    def test_invalid_credentials(self):
        response = self.client.post(self.login_api_path, {'email': 'wrong@example.com', 'password': 'wrong'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.json())
        self.assertEqual(response.json()['error'], 'Invalid credentials')

    # helper
    def _basic_login(self):
        login_data = {
            'email': self.kUserEmail,
            'password': self.kUserPassword
        }
        response = self.client.post(self.login_api_path, data=login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response

    def _login_with_2fa(self):
        self._basic_login()
        response = self._verify_2fa()
        return response

    def _verify_2fa(self):
        response = self.client.post(self.verify_2fa_api_url, {'token': self.otp_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response

    def _enable_2fa(self):
        response = self.client.get(self.enable_2fa_api_url)
        secret_key_base32 = response.json()['setup_key']
        totp = pyotp.TOTP(secret_key_base32)
        self.otp_token = totp.now()

        response = self.client.post(self.enable_2fa_api_url, {'token': self.otp_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.enable_2fa)  # enable

    def _logout(self):
        logout_api_url = reverse(self.kLogoutAPIName)
        self.client.get(logout_api_url)

    def _assert_jwt_in_cookie(self, response):
        self.assertIn('Access-Token', response.cookies)
        self.assertIn('Refresh-Token', response.cookies)
        self.assertNotEqual(response.cookies['Access-Token'].value, '')
        self.assertNotEqual(response.cookies['Refresh-Token'].value, '')

        access_token_cookie = response.cookies['Access-Token']
        self.assertTrue(access_token_cookie['httponly'])
        self.assertEqual(access_token_cookie['samesite'], 'Strict')
