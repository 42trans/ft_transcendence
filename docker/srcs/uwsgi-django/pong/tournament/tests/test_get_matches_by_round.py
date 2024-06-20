from django.test import TestCase, Client
from django.urls import reverse
from ...models import Tournament, Match
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status
from django.test import override_settings


@override_settings(SECURE_SSL_REDIRECT=False)
class TestGetMatchesByRound(TestCase):
	def setUp(self):
		User = get_user_model()
		self.user1 = User.objects.create_user(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
			nickname='TestUser1'
		)

		self.user2 = User.objects.create_user(
			email='testuser2@example.com',
			password='123alks;d;fjsakd45abcde',
			nickname='TestUser2'
		)

		self.tournament = Tournament.objects.create(
			name="Example Tournament",
			date=timezone.now(),
			player_nicknames=['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user1,
			is_finished=False
		)

		# 4試合
		for i in range(1, 5):
			Match.objects.create(
				tournament=self.tournament,
				round_number=1,
				match_number=i,
				player1=f'Player{i}',
				# とりあえずの名前なのでi+1.assertEqual用
				player2=f'Player{i+1}',
				# ended_at=timezone.now()
			)

		self.client = Client()
		self.__login(email='testuser@example.com', password='123alks;d;fjsakd45abcde')

	def __login(self, email, password):
		login_api_url = reverse('api_accounts:api_login')
		login_data = {'email': email, 'password': password}
		response = self.client.post(login_api_url, data=login_data)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

	def __logout(self):
		logout_api_url = reverse('api_accounts:api_logout')
		self.client.get(logout_api_url)

	def test_round_matches_multiple_success(self):
		"""複数の試合が正しく取得できるかテスト（1回戦の全試合）"""
		response = self.client.get(reverse('get_matches_by_round_latest_user_ongoing_tournament', kwargs={'round_number': 1}))
		self.assertEqual(response.status_code, 200)
		matches = response.json()['matches']
		self.assertEqual(len(matches), 4)
		for i, match in enumerate(matches, start=1):
			self.assertEqual(match['round_number'], 1)
			self.assertEqual(match['match_number'], i)
			self.assertEqual(match['player1'], f'Player{i}')
			self.assertEqual(match['player2'], f'Player{i+1}')

	def test_round_matches_not_found(self):
		"""
		試合が存在しないラウンドのリクエストテスト
		"""
		response = self.client.get(reverse('get_matches_by_round_latest_user_ongoing_tournament', kwargs={'round_number': 99}))
		self.assertEqual(response.status_code, 404)

	def test_unauthenticated_access(self):
		"""認証されていないユーザーのアクセステスト"""
		self.__logout()
		response = self.client.get(reverse('get_matches_by_round_latest_user_ongoing_tournament', kwargs={'round_number': 1}))
		self.assertEqual(response.status_code, 401)

	def test_wrong_method_access(self):
		"""不正なリクエストメソッドでのアクセステスト"""
		response = self.client.post(reverse('get_matches_by_round_latest_user_ongoing_tournament', kwargs={'round_number': 1}))
		self.assertEqual(response.status_code, 405)

	def test_get_round_matches_by_user2(self):
		"""主催トーナメントがないユーザーのリクエスト"""
		self.__logout()

		# user2でlogin
		self.__login(email='testuser2@example.com', password='123alks;d;fjsakd45abcde')

		response = self.client.get(reverse('get_matches_by_round_latest_user_ongoing_tournament', kwargs={'round_number': 1}))
		self.assertEqual(response.status_code, 404)
