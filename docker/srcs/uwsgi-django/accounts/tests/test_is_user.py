from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.messages import get_messages
from django.urls import reverse, resolve
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from django.test import override_settings


@override_settings(SECURE_SSL_REDIRECT=False)
class IsUserLoggedInAPITests(TestCase):
    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"
    kIsUserLoggedInAPIName = "api_accounts:api_is_user_logged_in"

    kUser1Email = "test1@example.com"
    kUser1Nickname = "test1"
    kUser1Password = "pass012345"

    kUser2Email = "test2@example.com"
    kUser2Nickname = "test2"
    kUser2Password = "pass012345"

    def setUp(self):
        self.login_api_path = reverse(self.kLoginAPIName)
        self.is_user_logged_in_api_path = reverse(self.kIsUserLoggedInAPIName)
        self.client = APIClient()

        User = get_user_model()
        self.user1 = User.objects.create_user(email=self.kUser1Email,
                                              nickname=self.kUser1Nickname,
                                              password=self.kUser1Password,
                                              enable_2fa=False)
        self.user2 = User.objects.create_user(email=self.kUser2Email,
                                              nickname=self.kUser2Nickname,
                                              password=self.kUser2Password,
                                              enable_2fa=True)
        self.user1_login_data = {
            'email': self.kUser1Email,
            'password': self.kUser1Password
        }
        self.user2_login_data = {
            'email': self.kUser2Email,
            'password': self.kUser2Password
        }

    def test_user1(self):
        self.client.force_authenticate(user=self.user1)

        response = self.client.get(self.is_user_logged_in_api_path)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()['is_logged_in'])

    def test_user2(self):
        self.client.force_authenticate(user=self.user2)

        response = self.client.get(self.is_user_logged_in_api_path)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()['is_logged_in'])

    def test_guest(self):
        response = self.client.get(self.is_user_logged_in_api_path)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.json()['is_logged_in'])


@override_settings(SECURE_SSL_REDIRECT=False)
class IsUserEnabled2FaAPITests(TestCase):
    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"
    kIsUserEnabled2FaAPIName = "api_accounts:api_is_user_enabled2fa"

    kUser1Email = "test1@example.com"
    kUser1Nickname = "test1"
    kUser1Password = "pass012345"

    kUser2Email = "test2@example.com"
    kUser2Nickname = "test2"
    kUser2Password = "pass012345"

    def setUp(self):
        self.login_api_path = reverse(self.kLoginAPIName)
        self.is_user_enabled2fa_api_path = reverse(self.kIsUserEnabled2FaAPIName)
        self.client = APIClient()

        User = get_user_model()
        self.user1 = User.objects.create_user(email=self.kUser1Email,
                                              nickname=self.kUser1Nickname,
                                              password=self.kUser1Password,
                                              enable_2fa=False)
        self.user2 = User.objects.create_user(email=self.kUser2Email,
                                              nickname=self.kUser2Nickname,
                                              password=self.kUser2Password,
                                              enable_2fa=True)
        self.user1_login_data = {
            'email': self.kUser1Email,
            'password': self.kUser1Password
        }
        self.user2_login_data = {
            'email': self.kUser2Email,
            'password': self.kUser2Password
        }

    def test_user1(self):
        self.client.force_authenticate(user=self.user1)

        response = self.client.get(self.is_user_enabled2fa_api_path)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.json()['is_enable2fa'])

    def test_user2(self):
        self.client.force_authenticate(user=self.user2)

        response = self.client.get(self.is_user_enabled2fa_api_path)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()['is_enable2fa'])

    def test_guest(self):
        response = self.client.get(self.is_user_enabled2fa_api_path)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.json()['is_enable2fa'])
