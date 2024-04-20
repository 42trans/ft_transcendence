from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.messages import get_messages
from django.urls import reverse, resolve
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient


class UserProfileAPITests(TestCase):
    kUserProfileAPIName = "accounts:api_user_profile"

    kUserEmail = "test@example.com"
    kUserNickname = "test"
    kUserPassword = "pass012345"

    def setUp(self):
        self.user_api_url = reverse(self.kUserProfileAPIName)
        self.client = APIClient()

        User = get_user_model()
        self.user = User.objects.create_user(email=self.kUserEmail,
                                             nickname=self.kUserNickname,
                                             password=self.kUserPassword,
                                             enable_2fa=False)

    def test_valid_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.user_api_url)

        response_json = response.json()
        self.assertIn(self.kUserEmail, response_json['email'])
        self.assertIn(self.kUserNickname, response_json['nickname'])
        self.assertFalse(response_json['enable_2fa'])

    def test_invalid_user(self):
        response = self.client.get(self.user_api_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class EditUserProfileAPITests(TestCase):
    kEditUserProfileAPIName = "accounts:api_edit_profile"
    kLoginAPIName = "accounts:api_login"
    kLogoutAPIName = "accounts:api_logout"

    kUserEmail = "test@example.com"
    kUserNickname = "test"
    kUserPassword = "pass012345"

    kUser2Email = "test2@example.com"
    kUser2Nickname = "test2"
    kUser2Password = "pass012345"

    def setUp(self):
        self.login_api_path = reverse(self.kLoginAPIName)
        self.edit_user_profile_url = reverse(self.kEditUserProfileAPIName)
        self.client = APIClient()

        User = get_user_model()
        self.user = User.objects.create_user(email=self.kUserEmail,
                                             nickname=self.kUserNickname,
                                             password=self.kUserPassword,
                                             enable_2fa=False)
        self.user2 = User.objects.create_user(email=self.kUser2Email,
                                             nickname=self.kUser2Nickname,
                                             password=self.kUser2Password,
                                             enable_2fa=False)
        login_data = {
            'email': self.kUserEmail,
            'password': self.kUserPassword
        }
        self.client.post(self.login_api_path, data=login_data)

    # nickname
    def test_update_nickname_successfully(self):
        new_nickname = 'newNickname'
        response = self.client.post(self.edit_user_profile_url, {'nickname': new_nickname})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(f'nickname updat successfully {self.kUserNickname} -> {new_nickname}',
                      response.data['message'])

        self.user.refresh_from_db()
        self.assertEqual(self.user.nickname, new_nickname)

    def test_update_nickname_fail_same_old_nickname(self):
        response = self.client.post(self.edit_user_profile_url, {'nickname': self.kUserNickname})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new nickname same as current', response.data['error'])

    def test_update_nickname_fail_already_use_nickname(self):
        response = self.client.post(self.edit_user_profile_url, {'nickname': self.kUser2Nickname})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('This nickname is already in use', response.data['error'])

    def test_update_nickname_fail_invalid_nickname(self):
        response = self.client.post(self.edit_user_profile_url, {'nickname': '*'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid nickname format', response.data['error'])


    # password
    def test_update_password_successfully(self):
        new_password = 'newPassword123'
        response = self.client.post(self.edit_user_profile_url, {
            'current_password': self.kUserPassword,
            'new_password': new_password
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('password updat successfully', response.data['message'])

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(new_password))

    def test_update_password_fail_incorrect_current(self):
        response = self.client.post(self.edit_user_profile_url, {
            'current_password': 'incorrectPassword',
            'new_password': 'newPassword123'
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Current password is incorrect', response.data['error'])

    def test_update_password_fail_same_as_current(self):
        response = self.client.post(self.edit_user_profile_url, {
            'current_password': self.kUserPassword,
            'new_password': self.kUserPassword
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new password same as current', response.data['error'])

    def test_update_password_fail_invalid_password(self):
        response = self.client.post(self.edit_user_profile_url, {
            'current_password': self.kUserPassword,
            'new_password': '012345'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())


    # other
    def test_no_data_provided(self):
        response = self.client.post(self.edit_user_profile_url, {})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Update profile error', response.data['error'])

    def test_un_login_user(self):
        logout_api_url = reverse(self.kLogoutAPIName)
        self.client.get(logout_api_url)

        response = self.client.post(self.edit_user_profile_url, {'nickname': 'newNickname'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
