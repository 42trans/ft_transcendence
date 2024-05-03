from django.test import TestCase, Client
from django.urls import reverse
from ...models import Tournament, Match
from django.utils import timezone
from django.contrib.auth import get_user_model

class TestGetUserOngoingMatches(TestCase):
	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
			nickname='TestUser1' 
		)
		self.user2 = User.objects.create_user(
			email='testuser2@example.com',
			password='223alks;d;fjsakd45abcde',
			nickname='TestUser2' 
		)

		self.tournament = Tournament.objects.create(
			# id フィールドが自動的に割り当て
			name="Example Tournament",
			date=timezone.now(),
			player_nicknames=['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user,
			is_finished=False
		)
		self.tournament2 = Tournament.objects.create(
			# id フィールドが自動的に割り当て
			name="Example2 Tournament",
			date=timezone.now() - timezone.timedelta(days=1),
			player_nicknames=['player11', 'player22', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user,
			is_finished=False
		)

		self.client = Client()
		self.client.login(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
		)
		
		Match.objects.create(
			tournament=self.tournament,
			round_number=1,
			match_number=1,
			player1='Player1',
			player2='Player2',
			date=timezone.now()
		)
		
	def test_ongoing_matches(self):
		"""
		正しく最新の未終了トーナメントのマッチが取得できるかテスト
		確認方法: nameがExample2ではない
		"""
		response = self.client.get(reverse('get_user_ongoing_matches'))
		self.assertEqual(response.status_code, 200)
		matches = response.json()['matches']
		self.assertEqual(len(matches), 1)
		self.assertEqual(matches[0]['tournament_name'], 'Example Tournament')

	def test_no_ongoing_matches(self):
		"""未終了のトーナメントがない場合の挙動をテスト"""
		Tournament.objects.all().update(is_finished=True)
		response = self.client.get(reverse('get_user_ongoing_matches'))
		self.assertEqual(response.status_code, 204)
		# レスポンスボディが空であることを確認
		self.assertEqual(response.content, b'')

	def test_unauthenticated_access(self):
		"""認証されていないユーザーのアクセステスト"""
		self.client.logout()
		response = self.client.get(reverse('get_user_ongoing_matches'))
		self.assertEqual(response.status_code, 302)

	def test_wrong_method_access(self):
		"""不正なリクエストメソッドでのアクセステスト"""
		response = self.client.post(reverse('get_user_ongoing_matches'))
		self.assertEqual(response.status_code, 405)

	def test_access_by_other_user(self):
		"""他のユーザーがアクセスした場合のテスト"""
		self.client.logout()
		self.client.login(
			email='testuser2@example.com',
			password='223alks;d;fjsakd45abcde')
		response = self.client.get(reverse('get_user_ongoing_matches'))
		self.assertEqual(response.status_code, 204)
		self.assertEqual(response.content, b'')
