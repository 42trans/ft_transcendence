from django.test import TestCase, Client
from django.urls import reverse
from ...models import Tournament
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status


class TestUserAllOngoingTournament(TestCase):
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

		self.tournament1 = Tournament.objects.create(
			# id フィールドが自動的に割り当て
			name="Example Tournament1",
			date=timezone.now(),
			player_nicknames=['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user,
			is_finished=False
		)
		self.tournament2 = Tournament.objects.create(
			name="Example Tournament2",
			date=timezone.now() - timezone.timedelta(days=1),
			player_nicknames=['player11', 'player22', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user,
			is_finished=False
		)
		self.tournament3 = Tournament.objects.create(
			name="Example Tournament3",
			date=timezone.now() - timezone.timedelta(days=1),
			player_nicknames=['player111', 'player22', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user2,
			is_finished=False
		)

		self.client = Client()
		self.__login(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
		)

	def __login(self, email, password):
		login_api_url = reverse('api_accounts:api_login')
		login_data = {'email': email, 'password': password}
		response = self.client.post(login_api_url, data=login_data)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

	def __logout(self):
		logout_api_url = reverse('api_accounts:api_logout')
		self.client.get(logout_api_url)

	def test_multiple_ongoing_tournaments_error(self):
		"""複数の未終了トーナメントが存在する場合に適切なエラーメッセージとIDを返すかテスト"""
		response = self.client.get(reverse('get_tournament_id_user_all_ongoing'))
		self.assertEqual(response.status_code, 200)
		response_data = response.json()
		self.assertEqual(response_data['status'], 'error')
		self.assertIn('Multiple ongoing tournaments found', response_data['message'])
		self.assertIn(self.tournament1.id, response_data['tournaments'])
		self.assertIn(self.tournament2.id, response_data['tournaments'])

	def test_no_ongoing_tournaments(self):
		"""未終了のトーナメントがない場合の挙動をテスト"""
		Tournament.objects.all().update(is_finished=True)
		response = self.client.get(reverse('get_tournament_id_user_all_ongoing'))
		self.assertEqual(response.status_code, 200)
		response_data = response.json()
		self.assertEqual(response_data['tournaments'], [])

	def test_unauthenticated_access(self):
		"""認証されていないユーザーのアクセステスト"""
		self.__logout()
		response = self.client.get(reverse('get_tournament_id_user_all_ongoing'))
		self.assertEqual(response.status_code, 401)

	def test_wrong_method_access(self):
		"""不正なリクエストメソッドでのアクセステスト"""
		response = self.client.post(reverse('get_tournament_id_user_all_ongoing'))
		self.assertEqual(response.status_code, 405)
