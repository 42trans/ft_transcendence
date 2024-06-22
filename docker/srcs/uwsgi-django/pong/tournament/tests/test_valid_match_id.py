from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.messages import get_messages
from django.urls import reverse, resolve
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from pong.models import Tournament, Match
from django.test import override_settings


@override_settings(SECURE_SSL_REDIRECT=False)
class IsValidMatchIdAPITests(TestCase):
    kLoginAPIName = "api_accounts:api_login"
    kLogoutAPIName = "api_accounts:api_logout"
    IsValidMatchIdApiName = "is_valid_match_id"

    kUser1Email = "test1@example.com"
    kUser1Nickname = "test1"
    kUser1Password = "pass012345"

    kUser2Email = "test2@example.com"
    kUser2Nickname = "test2"
    kUser2Password = "pass012345"

    def setUp(self):
        self.login_api_path = reverse(self.kLoginAPIName)
        self.client = APIClient()

        User = get_user_model()
        self.user1 = User.objects.create_user(email=self.kUser1Email,
                                              nickname=self.kUser1Nickname,
                                              password=self.kUser1Password,
                                              enable_2fa=False)
        self.user1_login_data = {
            'email': self.kUser1Email,
            'password': self.kUser1Password
        }

        self.tournament = Tournament.objects.create(
            name="Test Tournament",
            organizer=self.user1,
            player_nicknames=["player1", "player2", "player3", "player4",
                              "player5", "player6", "player7", "player8"]
        )

        self.match1 = Match.objects.create(
            tournament=self.tournament,
            round_number=1,
            match_number=1,
            player1="player1",
            player2="player2"
        )

        self.match2 = Match.objects.create(
            tournament=self.tournament,
            round_number=1,
            match_number=2,
            player1="player3",
            player2="player4"
        )

    def test_user1(self):
        self.client.force_authenticate(user=self.user1)

        ok_ids = [
            self.match1.id,
            self.match2.id
        ]
        for ok_id in ok_ids:
            print(f"testing ok_id: {ok_id}")
            is_valid_user_id_api_path = reverse(self.IsValidMatchIdApiName, args=[ok_id])
            response = self.client.get(is_valid_user_id_api_path)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue(response.json()['exists'])

        ng_200_ids = [
            "100",
            "999",
            "65535",
            "2147483647",
            "2147483648",
            "18446744073709551615",
        ]
        for ng_id in ng_200_ids:
            print(f"testing ng_id: {ng_id}")
            is_valid_user_id_api_path = reverse(self.IsValidMatchIdApiName, args=[ng_id])
            response = self.client.get(is_valid_user_id_api_path)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        ng_400_ids = [
            "0",
            "-1",
            "-2147483648",
            "-9223372036854775808",
            " ",
            "-",
            "hoge",
            "xxxxxxxxxxxx",
        ]
        for ng_id in ng_400_ids:
            print(f"testing ng_id: {ng_id}")
            is_valid_user_id_api_path = reverse(self.IsValidMatchIdApiName, args=[ng_id])
            response = self.client.get(is_valid_user_id_api_path)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_guest(self):
        is_valid_user_id_api_path = reverse(self.IsValidMatchIdApiName, args=[self.user1.id])
        response = self.client.get(is_valid_user_id_api_path)
        self.assertEqual(response.status_code, 401)
