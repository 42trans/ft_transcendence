from django.conf import settings
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import CustomUser
from django.test import override_settings


@override_settings(SECURE_SSL_REDIRECT=False)
class SignUpAPITests(TestCase):
    kSignUpAPIName = "api_accounts:api_signup"
    kUserEmail = "test@example.com"
    kUserNickname = "test"
    kUserPassword = "pass0123"

    def setUp(self):
        self.client = APIClient()
        self.signup_api_url = reverse(self.kSignUpAPIName)
        self.user_data = {
            'email': self.kUserEmail,
            'nickname': self.kUserNickname,
            'password1': self.kUserPassword,
            'password2': self.kUserPassword,
        }

        User = get_user_model()
        self.user = User.objects.create_user(email=self.kUserEmail,
                                             nickname=self.kUserNickname,
                                             password=self.kUserPassword,
                                             enable_2fa=False)

    def test_authenticated_user_redirect(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.signup_api_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Already logged in", response.json()['message'])
        self.assertIn(settings.URL_CONFIG['kSpaPongTopUrl'], response.json()['redirect'])

    def test_password_mismatch(self):
        user_data = self.user_data.copy()
        user_data['password2'] = 'wrong0123'
        response = self.client.post(self.signup_api_url, user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("passwords don't match", response.json()['error'])

    def test_invalid_email_already_use(self):
        user_data = self.user_data.copy()
        user_data['nickname'] = 'test1'
        response = self.client.post(self.signup_api_url, user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("This email is already in use", response.json()['error'])

    def test_invalid_email(self):
        user_data = self.user_data.copy()
        user_data['email'] = 'invalid-email'
        response = self.client.post(self.signup_api_url, user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())

    def test_invalid_email_empty(self):
        user_data = self.user_data.copy()
        user_data['email'] = ''
        response = self.client.post(self.signup_api_url, user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())

    def test_invalid_email_too_short(self):
        user_data = self.user_data.copy()
        user_data['email'] = 'a@b'
        response = self.client.post(self.signup_api_url, user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(f"The email must be at least {CustomUser.kEMAIL_MIN_LENGTH} characters", response.json()['error'])

    def test_invalid_email_too_long(self):
        user_data = self.user_data.copy()
        user_data['email'] = f"a@{'b' * 64}.com"
        response = self.client.post(self.signup_api_url, user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(f"The email must be {CustomUser.kEMAIL_MAX_LENGTH} characters or less", response.json()['error'])

    def test_invalid_nickname_already_use(self):
        user_data = self.user_data.copy()
        user_data['email'] = 'test1@signup.com'
        response = self.client.post(self.signup_api_url, user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("This nickname is already in use", response.json()['error'])

    def test_invalid_password_too_short(self):
        user_data = self.user_data.copy()
        user_data['email'] = 'test1@signup.com'
        user_data['nickname'] = 'test1'
        user_data['password1'] = "pass0"
        user_data['password2'] = "pass0"
        response = self.client.post(self.signup_api_url, user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("このパスワードは短すぎます。最低 8 文字以上必要です。", response.json()['error'])

    def test_invalid_password_too_long(self):
        user_data = self.user_data.copy()
        user_data['email'] = 'test1@signup.com'
        user_data['nickname'] = 'test1'
        user_data['password1'] = "pass0" + "0123456789" * 6
        user_data['password2'] = "pass0" + "0123456789" * 6
        response = self.client.post(self.signup_api_url, user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(f"The password must be {CustomUser.kPASSWORD_MAX_LENGTH} characters or less", response.json()['error'])

    def test_successful_signup(self):
        user_data = self.user_data.copy()
        user_data['email'] = 'test1@signup.com'
        user_data['nickname'] = 'test1'
        response = self.client.post(self.signup_api_url, user_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Signup successful", response.json()['message'])

        self.assertIn('Access-Token', response.cookies)
        self.assertIn('Refresh-Token', response.cookies)
        self.assertNotEqual(response.cookies['Access-Token'].value, '')
        self.assertNotEqual(response.cookies['Refresh-Token'].value, '')

    def test_signup_exception(self):
        user_data = self.user_data.copy()
        user_data['email'] = 'error@signup.com'
        with self.assertRaises(Exception):
            self.client.post(self.signup_api_url, data)
            self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
            self.assertIn('error', response.json())
