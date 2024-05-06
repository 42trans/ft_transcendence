from django.test import TestCase, Client
from django.urls import reverse
from ...models import Tournament, Match
from django.utils import timezone
from django.contrib.auth import get_user_model

class TestGetMatchesByRound(TestCase):
	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
			nickname='TestUser1'
		)

		self.tournament = Tournament.objects.create(
			name="Example Tournament",
			date=timezone.now(),
			player_nicknames=['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user,
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
		self.client.login(email='testuser@example.com', password='123alks;d;fjsakd45abcde')

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
		self.client.logout()
		response = self.client.get(reverse('get_matches_by_round_latest_user_ongoing_tournament', kwargs={'round_number': 1}))
		self.assertEqual(response.status_code, 302)  # 未認証の場合はリダイレクトされる

	def test_wrong_method_access(self):
		"""不正なリクエストメソッドでのアクセステスト"""
		response = self.client.post(reverse('get_matches_by_round_latest_user_ongoing_tournament', kwargs={'round_number': 1}))
		self.assertEqual(response.status_code, 405)
