from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.http import JsonResponse
from django.urls import reverse, resolve
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import CustomUser, Friend


class SendFriendRequestAPITestCase(TestCase):
    kUser1Email = 'test1@example.com'
    kUser1Nickname = 'test1'
    kUser1Password = 'pass012345'

    kUser2Email = 'test2@example.com'
    kUser2Nickname = 'test2'
    kUser2Password = 'pass012345'

    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"
    kSendFriendRequestAPIName = "api_accounts:send_friend_request"

    def setUp(self):
        self.client = APIClient()
        self.login_path = reverse(self.kLoginAPIName)

        self.user1 = CustomUser.objects.create_user(email=self.kUser1Email,
                                                    nickname=self.kUser1Nickname,
                                                    password=self.kUser1Password,
                                                    enable_2fa=False)
        self.user1.save()

        self.user2 = CustomUser.objects.create_user(email=self.kUser2Email,
                                                    nickname=self.kUser2Nickname,
                                                    password=self.kUser2Password,
                                                    enable_2fa=False)
        self.user2.save()
        self.__login(self.kUser1Email, self.kUser1Password)

    def __login(self, email, password):
        login_api_url = reverse(self.kLoginAPIName)

        login_data = {
            'email': email,
            'password': password
        }
        response = self.client.post(login_api_url, data=login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def __logout(self):
        logout_api_url = reverse(self.kLogoutAPIName)
        self.client.get(logout_api_url)

    def test_send_friend_request_successfully(self):
        """
        友人申請を正常に送信できるユーザーへのリクエスト
         -> 200
            status: 'Friend request sent successfully
        """
        user_id = self.user2.id
        url = reverse(self.kSendFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Friend request sent successfully', response.data['status'])

    def test_send_friend_request_unauthenticated(self):
        """
        loginしていないユーザーがPOST
         -> 401
        """
        self.__logout()

        user_id = self.user2.id
        url = reverse(self.kSendFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_send_friend_request_to_already_friend(self):
        """
        すでに友人であるユーザーへのリクエスト
         -> 400
            error: 'Already friend'
        """
        Friend.objects.create(sender=self.user1,
                              receiver=self.user2,
                              status=Friend.FriendStatus.ACCEPTED)
        self.assertTrue(Friend.is_friend(self.user1, self.user2))

        user_id = self.user2.id
        url = reverse(self.kSendFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Already friend', response.data['error'])

    def test_send_friend_request_to_myself(self):
        """
        自分自身に対するリクエスト
         -> 400
            error: Cannot send request to yourself
        """
        Friend.objects.create(sender=self.user1,
                              receiver=self.user2,
                              status=Friend.FriendStatus.ACCEPTED)
        self.assertTrue(Friend.is_friend(self.user1, self.user2))

        user_id = self.user1.id
        url = reverse(self.kSendFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot send request to yourself', response.data['error'])

    def test_send_friend_request_already_sent(self):
        """
        すでにリクエストを送信済み（Pending）のユーザーへのリクエスト
         -> 400
            error: 'Friend request already friends'
        """
        Friend.objects.create(sender=self.user1,
                              receiver=self.user2,
                              status=Friend.FriendStatus.PENDING)

        user_id = self.user2.id
        url = reverse(self.kSendFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Friend request already friends', response.data['error'])

    def test_send_friend_request_already_received(self):
        """
        すでにリクエストを受信済み（Pending）のユーザーへのリクエスト
         -> 400
            error: 'Friend request already friends'
        """
        Friend.objects.create(sender=self.user1,
                              receiver=self.user2,
                              status=Friend.FriendStatus.PENDING)

        user_id = self.user2.id
        url = reverse(self.kSendFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Friend request already friends', response.data['error'])

    def test_send_friend_request_to_nonexistent_user(self):
        """
        存在しないユーザーIDに対するリクエスト
         -> 400
            error: 'User not found'
        """
        invalid_user_id = 99999
        url = reverse(self.kSendFriendRequestAPIName, kwargs={'user_id': invalid_user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('User not found', response.data['error'])


class CancelFriendRequestAPITestCase(TestCase):
    kUser1Email = 'test1@example.com'
    kUser1Nickname = 'test1'
    kUser1Password = 'pass012345'

    kUser2Email = 'test2@example.com'
    kUser2Nickname = 'test2'
    kUser2Password = 'pass012345'

    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"
    kCancelFriendRequestAPIName = "api_accounts:cancel_friend_request"

    def setUp(self):
        self.client = APIClient()
        self.login_path = reverse(self.kLoginAPIName)

        self.user1 = CustomUser.objects.create_user(email=self.kUser1Email,
                                                    nickname=self.kUser1Nickname,
                                                    password=self.kUser1Password,
                                                    enable_2fa=False)
        self.user1.save()

        self.user2 = CustomUser.objects.create_user(email=self.kUser2Email,
                                                    nickname=self.kUser2Nickname,
                                                    password=self.kUser2Password,
                                                    enable_2fa=False)
        self.user2.save()
        self.__login(self.kUser1Email, self.kUser1Password)

    def __login(self, email, password):
        login_api_url = reverse(self.kLoginAPIName)

        login_data = {
            'email': email,
            'password': password
        }
        response = self.client.post(login_api_url, data=login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def __logout(self):
        logout_api_url = reverse(self.kLogoutAPIName)
        self.client.get(logout_api_url)

    def test_cancel_friend_request_successfully(self):
        """
        正常にフレンドリクエストをキャンセルする
         -> 200
            Friend request cancelled
        """
        Friend.objects.create(sender=self.user1,
                              receiver=self.user2,
                              status=Friend.FriendStatus.PENDING)
        user_id = self.user2.id
        url = reverse(self.kCancelFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Friend request cancelled', response.data['status'])

    def test_cancel_friend_request_unauthenticated(self):
        """
        認証されていないユーザーがキャンセルを試みる
         -> 401
        """
        self.__logout()

        user_id = self.user2.id
        url = reverse(self.kCancelFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cancel_friend_request_to_nonexistent_user(self):
        """
        存在しないユーザーIDに対するキャンセル
         -> 400
            error: User not found
        """
        invalid_user_id = 99999
        url = reverse(self.kCancelFriendRequestAPIName, kwargs={'user_id': invalid_user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('User not found', response.data['error'])

    def test_cancel_friend_request_to_myself(self):
        """
        自分自身に対するリクエスト
         -> 400
            error: Cannot send request to yourself
        """
        user_id = self.user1.id
        url = reverse(self.kCancelFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot send request to yourself', response.data['error'])

    def test_cancel_nonexistent_friend_request(self):
        """
        存在しないリクエストのキャンセルを試みる
         -> 400
            error: Friend request not found
        """
        user_id = self.user2.id
        url = reverse(self.kCancelFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Friend request not found', response.data['error'])


class AcceptFriendRequestAPITestCase(TestCase):
    kUser1Email = 'test1@example.com'
    kUser1Nickname = 'test1'
    kUser1Password = 'pass012345'

    kUser2Email = 'test2@example.com'
    kUser2Nickname = 'test2'
    kUser2Password = 'pass012345'

    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"
    kAcceptFriendRequestAPIName = "api_accounts:accept_friend_request"

    def setUp(self):
        self.client = APIClient()
        self.login_path = reverse(self.kLoginAPIName)

        self.user1 = CustomUser.objects.create_user(email=self.kUser1Email,
                                                    nickname=self.kUser1Nickname,
                                                    password=self.kUser1Password,
                                                    enable_2fa=False)
        self.user1.save()

        self.user2 = CustomUser.objects.create_user(email=self.kUser2Email,
                                                    nickname=self.kUser2Nickname,
                                                    password=self.kUser2Password,
                                                    enable_2fa=False)
        self.user2.save()
        self.__login(self.kUser1Email, self.kUser1Password)

    def __login(self, email, password):
        login_api_url = reverse(self.kLoginAPIName)
        login_data = {'email': email, 'password': password}
        response = self.client.post(login_api_url, data=login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def __logout(self):
        logout_api_url = reverse(self.kLogoutAPIName)
        self.client.get(logout_api_url)

    def test_accept_friend_request_successfully(self):
        """
        正常にフレンドリクエストを承認する
         -> 200
            success: accept request
        """
        Friend.objects.create(sender=self.user2,
                              receiver=self.user1,
                              status=Friend.FriendStatus.PENDING)
        user_id = self.user2.id
        url = reverse(self.kAcceptFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Success: accept request', response.data['status'])

    def test_accept_friend_request_unauthenticated(self):
        """
        認証されていないユーザーがリクエスト承認を試みる
         -> 401
        """
        self.__logout()
        user_id = self.user1.id
        url = reverse(self.kAcceptFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_accept_friend_request_to_nonexistent_user(self):
        """
        存在しないユーザーからのリクエストを承認しようとする
         -> 400
            error: User not found
        """
        invalid_user_id = 99999
        url = reverse(self.kAcceptFriendRequestAPIName, kwargs={'user_id': invalid_user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('User not found', response.data['error'])

    def test_accept_friend_request_to_myself(self):
        """
        自分自身に対するリクエスト
         -> 400
            error: Cannot send request to yourself
        """
        user_id = self.user1.id
        url = reverse(self.kAcceptFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot send request to yourself', response.data['error'])

    def test_accept_nonexistent_friend_request(self):
        """
        存在しないリクエストの承認を試みる
         -> 400
            error: Friend request not found
        """
        user_id = self.user2.id
        url = reverse(self.kAcceptFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Friend request not found', response.data['error'])


class RejectFriendRequestAPITestCase(TestCase):
    kUser1Email = 'test1@example.com'
    kUser1Nickname = 'test1'
    kUser1Password = 'pass012345'

    kUser2Email = 'test2@example.com'
    kUser2Nickname = 'test2'
    kUser2Password = 'pass012345'

    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"
    kRejectFriendRequestAPIName = "api_accounts:reject_friend_request"

    def setUp(self):
        self.client = APIClient()
        self.login_path = reverse(self.kLoginAPIName)

        self.user1 = CustomUser.objects.create_user(email=self.kUser1Email,
                                                    nickname=self.kUser1Nickname,
                                                    password=self.kUser1Password,
                                                    enable_2fa=False)
        self.user1.save()

        self.user2 = CustomUser.objects.create_user(email=self.kUser2Email,
                                                    nickname=self.kUser2Nickname,
                                                    password=self.kUser2Password,
                                                    enable_2fa=False)
        self.user2.save()
        self.__login(self.kUser1Email, self.kUser1Password)

    def __login(self, email, password):
        login_api_url = reverse(self.kLoginAPIName)
        login_data = {'email': email, 'password': password}
        response = self.client.post(login_api_url, data=login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def __logout(self):
        logout_api_url = reverse(self.kLogoutAPIName)
        self.client.get(logout_api_url)

    def test_reject_friend_request_successfully(self):
        """
        正常にフレンドリクエストを拒否する
         -> 200
            status: Success: reject request
        """
        Friend.objects.create(sender=self.user2,
                              receiver=self.user1,
                              status=Friend.FriendStatus.PENDING)
        user_id = self.user2.id
        url = reverse(self.kRejectFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Success: reject request', response.data['status'])

    def test_reject_friend_request_unauthenticated(self):
        """
        認証されていないユーザーがリクエスト拒否を試みる
         -> 401 Unauthorized
        """
        self.__logout()
        user_id = self.user1.id
        url = reverse(self.kRejectFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_reject_friend_request_to_nonexistent_user(self):
        """
        存在しないユーザーからのリクエストを拒否しようとする
         -> 400
            error: User not found
        """
        invalid_user_id = 99999
        url = reverse(self.kRejectFriendRequestAPIName, kwargs={'user_id': invalid_user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('User not found', response.data['error'])

    def test_reject_friend_request_to_myself(self):
        """
        自分自身に対するリクエスト
         -> 400
            error: Cannot send request to yourself
        """
        user_id = self.user1.id
        url = reverse(self.kRejectFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot send request to yourself', response.data['error'])

    def test_reject_nonexistent_friend_request(self):
        """
        存在しないリクエストの拒否を試みる
         -> 400
            error: Friend request not found
        """
        user_id = self.user2.id
        url = reverse(self.kRejectFriendRequestAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Friend request not found', response.data['error'])


class DeleteFriendAPITestCase(TestCase):
    kUser1Email = 'test1@example.com'
    kUser1Nickname = 'test1'
    kUser1Password = 'pass012345'

    kUser2Email = 'test2@example.com'
    kUser2Nickname = 'test2'
    kUser2Password = 'pass012345'

    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"
    kDeleteFriendAPIName = "api_accounts:delete_friend"

    def setUp(self):
        self.client = APIClient()
        self.login_path = reverse(self.kLoginAPIName)

        self.user1 = CustomUser.objects.create_user(email=self.kUser1Email,
                                                    nickname=self.kUser1Nickname,
                                                    password=self.kUser1Password,
                                                    enable_2fa=False)
        self.user1.save()

        self.user2 = CustomUser.objects.create_user(email=self.kUser2Email,
                                                    nickname=self.kUser2Nickname,
                                                    password=self.kUser2Password,
                                                    enable_2fa=False)
        self.user2.save()
        self.__login(self.kUser1Email, self.kUser1Password)

    def __login(self, email, password):
        login_api_url = reverse(self.kLoginAPIName)
        login_data = {'email': email, 'password': password}
        response = self.client.post(login_api_url, data=login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def __logout(self):
        logout_api_url = reverse(self.kLogoutAPIName)
        self.client.get(logout_api_url)

    def test_delete_friend_successfully(self):
        """
        フレンド関係を正常に削除する
         -> 200
            status: Success: delete friend
        """
        Friend.objects.create(sender=self.user1,
                              receiver=self.user2,
                              status=Friend.FriendStatus.ACCEPTED)
        user_id = self.user2.id
        url = reverse(self.kDeleteFriendAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Success: delete friend', response.data['status'])

    def test_delete_friend_relationship_to_myself(self):
        """
        自分自身とのフレンド関係を削除しようとする
         -> 400
            error: Cannot send request to yourself
        """
        user_id = self.user1.id
        url = reverse(self.kDeleteFriendAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot send request to yourself', response.data['error'])

    def test_delete_friend_unauthenticated(self):
        """
        認証されていないユーザーがフレンド削除を試みる
         -> 401
        """
        self.__logout()
        user_id = self.user1.id
        url = reverse(self.kDeleteFriendAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_friend_with_nonexistent_user(self):
        """
        存在しないユーザーとのフレンド関係を削除しようとする
         -> 400
            errro: User not found
        """
        invalid_user_id = 99999
        url = reverse(self.kDeleteFriendAPIName, kwargs={'user_id': invalid_user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('User not found', response.data['error'])

    def test_delete_non_friend_relationship(self):
        """
        フレンドでないユーザーとの関係を削除しようとする
         -> 400
            error: Friend not found.
        """
        user_id = self.user2.id
        url = reverse(self.kDeleteFriendAPIName, kwargs={'user_id': user_id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Friend not found.', response.data['error'])
