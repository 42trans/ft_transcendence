from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.http import JsonResponse
from django.urls import reverse, resolve
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import CustomUser, UserManager


class LoginAPIViewTestCase(TestCase):
    kUser1Email = 'test1@example.com'
    kUser1Nickname = 'test1'
    kUser1Password = 'pass012345'

    kUser2Email = 'test2@example.com'
    kUser2Nickname = 'test2'
    kUser2Password = 'pass012345'

    kLoginAPIName = "api_accounts:api_login"
    kHomeURL = "/game/"

    def setUp(self):
        self.client = APIClient()
        self.login_path = reverse(self.kLoginAPIName)

        User = get_user_model()
        self._with_2fa = User.objects.create_user(email=self.kUser1Email,
                                                  nickname=self.kUser1Nickname,
                                                  password=self.kUser1Password,
                                                  enable_2fa=True)

        self.user = User.objects.create_user(email=self.kUser2Email,
                                             nickname=self.kUser2Nickname,
                                             password=self.kUser2Password,
                                             enable_2fa=False)

    def test_already_logged_in(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(self.login_path)
        response_json = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('already logged in', response_json['message'])

    def test_invalid_credentials(self):
        login_data = {
            'email': 'wrong@example.com',
            'password': 'wrong'
        }
        response = self.client.post(self.login_path, data=login_data)
        response_json = response.json()

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Invalid credentials', response_json['error'])

    def test_2fa_authentication_needed(self):
        login_data = {
            'email': self.kUser1Email,
            'password': self.kUser1Password
        }
        response = self.client.post(self.login_path, data=login_data)
        response_json = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('2fa authentication needed', response_json['message'])
        self.assertIn('/verify-2fa/', response_json['redirect'])

    def test_basic_authentication_successful(self):
        login_data = {
            'email': self.kUser2Email,
            'password': self.kUser2Password
        }
        response = self.client.post(self.login_path, data=login_data)
        response_json = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Basic authentication successful', response_json['message'])
        self.assertIn(self.kHomeURL, response_json['redirect'])

        self.assertIn('Access-Token', response.cookies)
        self.assertIn('Refresh-Token', response.cookies)
        self.assertNotEqual(response.cookies['Access-Token'].value, '')
        self.assertNotEqual(response.cookies['Refresh-Token'].value, '')
