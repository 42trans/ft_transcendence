from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from accounts.models import CustomUser
from django.test import override_settings


@override_settings(SECURE_SSL_REDIRECT=False)
class UserBlockTestCase(TestCase):
    kUser1Email = 'test1@example.com'
    kUser1Nickname = 'test1'
    kUser1Password = 'pass012345'

    kUser2Email = 'test2@example.com'
    kUser2Nickname = 'test2'
    kUser2Password = 'pass012345'

    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"

    kBlockAPIName = 'api_accounts:api_block'
    kUnblockAPIName = 'api_accounts:api_unblock'

    def setUp(self):
        self.client = APIClient()
        self.user1 = CustomUser.objects.create_user(email=self.kUser1Email,
                                                    nickname=self.kUser1Nickname,
                                                    password=self.kUser1Password)
        self.user2 = CustomUser.objects.create_user(email=self.kUser2Email,
                                                    nickname=self.kUser2Nickname,
                                                    password=self.kUser2Password)
        self.__login(self.kUser1Email, self.kUser1Password)

    def __login(self, email, password):
        login_api_url = reverse(self.kLoginAPIName)
        login_data = {'email': email, 'password': password}
        response = self.client.post(login_api_url, data=login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def __logout(self):
        logout_api_url = reverse(self.kLogoutAPIName)
        self.client.get(logout_api_url)

    def test_block_user_successfully(self):
        """
        ユーザーが別のユーザーをブロックするテスト
         -> 200
            User nickname successfully blocked
        """
        self.assertFalse(self.user1.is_blocking_user(self.user2))  # user1 unblocking user2

        url = reverse(self.kBlockAPIName, kwargs={'user_id': self.user2.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(f'User {self.user2.nickname} successfully blocked', response.data['message'])

        self.assertTrue(self.user1.is_blocking_user(self.user2))  # user1 blocking user2

    def test_block_unauthenticated(self):
        """
        認証されていないユーザーがブロックしようとする
         -> 401 Unauthorized
        """
        self.__logout()

        url = reverse(self.kBlockAPIName, kwargs={'user_id': self.user2.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_block_myself(self):
        """
        ユーザーが自分自身をブロックしようとするテスト
         -> 400
            message: Cannot block yourself
        """
        url = reverse(self.kBlockAPIName, kwargs={'user_id': self.user1.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Cannot block yourself', response.data['error'])

    def test_block_already_blocked_user(self):
        """
        ブロック済みのユーザーををブロックするテスト
         -> 400
            message: Already blocked
        """
        self.user1.block_user(self.user2)
        self.assertTrue(self.user1.is_blocking_user(self.user2))  # user1 blocking user2

        url = reverse(self.kBlockAPIName, kwargs={'user_id': self.user2.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(f'Already blocked', response.data['error'])

        self.assertTrue(self.user1.is_blocking_user(self.user2))  # user1 blocking user2


@override_settings(SECURE_SSL_REDIRECT=False)
class UserUnblockTestCase(TestCase):
    kUser1Email = 'test1@example.com'
    kUser1Nickname = 'test1'
    kUser1Password = 'pass012345'

    kUser2Email = 'test2@example.com'
    kUser2Nickname = 'test2'
    kUser2Password = 'pass012345'

    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"

    kBlockAPIName = 'api_accounts:api_block'
    kUnblockAPIName = 'api_accounts:api_unblock'

    def setUp(self):
        self.client = APIClient()
        self.user1 = CustomUser.objects.create_user(email=self.kUser1Email,
                                                    nickname=self.kUser1Nickname,
                                                    password=self.kUser1Password)
        self.user2 = CustomUser.objects.create_user(email=self.kUser2Email,
                                                    nickname=self.kUser2Nickname,
                                                    password=self.kUser2Password)
        self.__login(self.kUser1Email, self.kUser1Password)

    def __login(self, email, password):
        login_api_url = reverse(self.kLoginAPIName)
        login_data = {'email': email, 'password': password}
        response = self.client.post(login_api_url, data=login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def __logout(self):
        logout_api_url = reverse(self.kLogoutAPIName)
        self.client.get(logout_api_url)

    def test_unblock_user_successfully(self):
        """
        ブロックを解除するテスト
         -> 200
            message: User nickname successfully unblocked
        """
        self.user1.block_user(self.user2)
        self.user1.save()
        self.assertTrue(self.user1.is_blocking_user(self.user2))  # user1 blocking user2

        url = reverse(self.kUnblockAPIName, kwargs={'user_id': self.user2.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(f'User {self.user2.nickname} successfully unblocked', response.data['message'])

        self.assertFalse(self.user1.is_blocking_user(self.user2))  # user1 unblocking user2

    def test_unblock_unauthenticated(self):
        """
        認証されていないユーザーがブロックしようとする
         -> 401 Unauthorized
        """
        self.__logout()

        url = reverse(self.kUnblockAPIName, kwargs={'user_id': self.user2.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unblock_myself(self):
        """
        ユーザーが自分自身のブロックを解除しようとするテスト
         -> 400
            message: Cannot unblock yourself
        """
        url = reverse(self.kUnblockAPIName, kwargs={'user_id': self.user1.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Cannot unblock yourself', response.data['error'])

    def test_unblock_unblocked_user(self):
        """
        ブロックしていないユーザーをブロック解除するテスト
         -> 400
            message: Already un blocked
        """
        self.assertFalse(self.user1.is_blocking_user(self.user2))  # user1 unblocking user2

        url = reverse(self.kUnblockAPIName, kwargs={'user_id': self.user2.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(f'Already un blocked', response.data['error'])

        self.assertFalse(self.user1.is_blocking_user(self.user2))  # user1 unblocking user2
