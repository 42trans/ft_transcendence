# docker/srcs/uwsgi-django/pong/tournament/tests/get_latest_user_ongoing_tournament.py
from django.test import TestCase, Client
from django.urls import reverse
from ...models import Tournament
import json
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from django.test import override_settings


@override_settings(SECURE_SSL_REDIRECT=False)
class TestGetLatestOngoingTournament(TestCase):
	def setUp(self):
		self.get_latest_tournament_url = reverse('get_latest_user_ongoing_tournament')
		self.players = ['Player1', 'Player2', 'Player3', 'Player4',
						'Player5', 'Player6', 'Player7', 'Player8']

		User = get_user_model()
		self.user1 = User.objects.create_user(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
			nickname='TestUser1' 
		)
		self.user2 = User.objects.create_user(
			email='testuser2@example.com',
			password='223alks;d;fjsakd45abcde',
			nickname='TestUser2' 
		)
		self.client = Client()
		self.__login(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
		)

		# 未終了のトーナメントを二つ作成
		Tournament.objects.create(
			name="Tournament One",
			date=timezone.now() - timezone.timedelta(days=1),
			organizer=self.user1,
			player_nicknames=self.players,
			is_finished=False
		)
		Tournament.objects.create(
			name="Tournament Two",
			date=timezone.now(),
			organizer=self.user1,
			player_nicknames=self.players,
			is_finished=False
		)

	def __login(self, email, password):
		login_api_url = reverse('api_accounts:api_login')
		login_data = {'email': email, 'password': password}
		response = self.client.post(login_api_url, data=login_data)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

	def __logout(self):
		logout_api_url = reverse('api_accounts:api_logout')
		self.client.get(logout_api_url)

	def test_get_latest_ongoing_tournament(self):
		"""最新の未終了トーナメントが正しく取得できるか確認"""
		response = self.client.get(self.get_latest_tournament_url)
		self.assertEqual(response.status_code, 200)
		response_data = json.loads(response.content)
		self.assertEqual(response_data['tournament']['name'], 'Tournament Two')

	def test_no_ongoing_tournaments(self):
		"""未終了のトーナメントが存在しない場合の挙動を確認"""
		# すべて終了状態に
		Tournament.objects.all().update(is_finished=True) 
		response = self.client.get(self.get_latest_tournament_url)
		self.assertEqual(response.status_code, 204)
		# HTTP 204応答ではレスポンスボディが空であることを確認
		self.assertEqual(response.content, b'')

	def test_unauthenticated_access(self):
		"""認証されていないアクセスが拒否されること"""
		# ログアウト
		self.__logout()
		response = self.client.get(self.get_latest_tournament_url)
		self.assertNotEqual(response.status_code, 200)
		self.assertEqual(response.status_code, 401)

	def test_wrong_method_access(self):
		"""不正なリクエストメソッドでアクセスした場合のエラー確認"""
		response = self.client.post(self.get_latest_tournament_url)
		self.assertEqual(response.status_code, 405)

	def test_access_by_other_user(self):
		"""他のユーザーがアクセスした場合に未終了トーナメントが取得されないこと"""
		self.__logout()
		self.__login(
			email='testuser2@example.com',
			password='223alks;d;fjsakd45abcde')
		response = self.client.get(self.get_latest_tournament_url)
		self.assertEqual(response.status_code, 204)
