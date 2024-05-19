from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.urls import reverse
from django.test import TestCase
from rest_framework import status

from accounts.models import CustomUser, UserManager


class LogoutAPITests(TestCase):
    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"
    kLoginURL = "accounts/login.html"
    kLogoutURL = "accounts/logout.html"
    kHomeURL = "/game/"

    kUserEmail = "test@example.com"
    kUserNickname = "test"
    kUserPassword = "pass012345"

    def setUp(self):
        self.login_api_path = reverse(self.kLoginAPIName)
        self.logout_api_url = reverse(self.kLogoutAPIName)

        User = get_user_model()
        self.user = User.objects.create_user(email=self.kUserEmail,
                                             nickname=self.kUserNickname,
                                             password=self.kUserPassword,
                                             enable_2fa=False)

    def test_logout_success(self):
        # login
        login_data = {
            'email': self.kUserEmail,
            'password': self.kUserPassword
        }
        response = self.client.post(self.login_api_path, data=login_data)

        # logout
        response = self.client.get(self.logout_api_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_json = response.json()
        self.assertIn('You have been successfully logout', response_json['message'])
        self.assertIn(self.kHomeURL, response_json['redirect'])

        self.assertTrue(response.cookies.get('Access-Token', '').value == '')
        self.assertTrue(response.cookies.get('Refresh-Token', '').value == '')

        self.assertIsNone(self.client.session.get('_auth_user_id'))


    def test_logout_unauthenticated(self):
        response = self.client.get(self.logout_api_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
