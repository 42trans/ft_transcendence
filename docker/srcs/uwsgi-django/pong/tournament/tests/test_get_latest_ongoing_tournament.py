# docker/srcs/uwsgi-django/pong/tournament/tests/get_latest_user_ongoing_tournament.py
from django.test import TestCase, Client
from django.urls import reverse
from ...models import Tournament
import json
from django.contrib.auth import get_user_model
from django.utils import timezone

class TestGetLatestOngoingTournament(TestCase):
	def setUp(self):
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
		self.client.login(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
		)

		# 未終了のトーナメントを二つ作成
		Tournament.objects.create(
			name="Tournament One",
			date=timezone.now() - timezone.timedelta(days=1),
			organizer=self.user1,
			player_nicknames=['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'],
			is_finished=False
		)
		Tournament.objects.create(
			name="Tournament Two",
			date=timezone.now(),
			organizer=self.user1,
			player_nicknames=['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'],
			is_finished=False
		)

	def test_get_latest_ongoing_tournament(self):
		"""最新の未終了トーナメントが正しく取得できるか確認"""
		response = self.client.get(reverse('get_latest_user_ongoing_tournament'))
		self.assertEqual(response.status_code, 200)
		response_data = json.loads(response.content)
		self.assertEqual(response_data['tournament']['name'], 'Tournament Two')

	def test_no_ongoing_tournaments(self):
		"""未終了のトーナメントが存在しない場合の挙動を確認"""
		# すべて終了状態に
		Tournament.objects.all().update(is_finished=True) 
		response = self.client.get(reverse('get_latest_user_ongoing_tournament'))
		self.assertEqual(response.status_code, 204)
		# HTTP 204応答ではレスポンスボディが空であることを確認
		self.assertEqual(response.content, b'')

	def test_unauthenticated_access(self):
		"""認証されていないアクセスが拒否されること"""
		# ログアウト
		self.client.logout()
		response = self.client.get(reverse('get_latest_user_ongoing_tournament'))
		self.assertNotEqual(response.status_code, 200)
		self.assertEqual(response.status_code, 302)
		self.assertTrue(response.url.startswith('/accounts/login'))

	def test_wrong_method_access(self):
		"""不正なリクエストメソッドでアクセスした場合のエラー確認"""
		response = self.client.post(reverse('get_latest_user_ongoing_tournament'))
		self.assertEqual(response.status_code, 405)

	def test_access_by_other_user(self):
		"""他のユーザーがアクセスした場合に未終了トーナメントが取得されないこと"""
		self.client.logout()
		self.client.login(
			email='testuser2@example.com',
			password='223alks;d;fjsakd45abcde')
		response = self.client.get(reverse('get_latest_user_ongoing_tournament'))
		self.assertEqual(response.status_code, 204)
