# docker/srcs/uwsgi-django/pong/tournament/tests/test_tournament_data.py

from django.test import TestCase, Client
from django.urls import reverse
from ...models import Tournament
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from django.test import override_settings


@override_settings(SECURE_SSL_REDIRECT=False)
class TestTournamentData(TestCase):
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

		self.t1_name = "Example Tournament 1"
		self.t2_name = "Example Tournament 2"
		self.t3_name = "Example Tournament 3"

		self.t1_players = ['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8']
		self.t2_players = ['player11', 'player22', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8']
		self.t3_players = ['player111', 'player22', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8']

		self.tournament1 = Tournament.objects.create(
			# id フィールドが自動的に割り当て
			name=self.t1_name,
			date=timezone.now(),
			player_nicknames=self.t1_players,
			organizer=self.user1,
			is_finished=False
		)
		self.tournament2 = Tournament.objects.create(
			# id フィールドが自動的に割り当て
			name=self.t2_name,
			date=timezone.now() - timezone.timedelta(days=1),
			player_nicknames=self.t2_players,
			organizer=self.user1,
			is_finished=False
		)
		self.tournament3 = Tournament.objects.create(
			# id フィールドが自動的に割り当て
			name=self.t3_name,
			date=timezone.now() - timezone.timedelta(days=1),
			player_nicknames=self.t3_players,
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

	def test_tournament_data_success(self):
		"""トーナメントデータが正しく取得できるかテスト"""
		response = self.client.get(reverse('get_tournament_data_by_id', kwargs={'tournament_id': self.tournament1.id}))
		self.assertEqual(response.status_code, 200)
		response_data = response.json()
		self.assertEqual(response_data['id'], self.tournament1.id)
		self.assertEqual(response_data['name'], self.t1_name)
		self.assertEqual(response_data['player_nicknames'], self.t1_players)
		self.assertEqual(response_data['organizer'], self.user1.id)

	def test_unauthenticated_access(self):
		"""認証されていないユーザーが正しく取得できるかテスト"""
		self.__logout()  # ユーザーをログアウト
		response = self.client.get(reverse('get_tournament_data_by_id', kwargs={'tournament_id': self.tournament1.id}))
		response_data = response.json()
		# self.assertEqual(response_data['id'], self.tournament1.id)
		# self.assertEqual(response_data['name'], self.t1_name)
		# self.assertEqual(response_data['player_nicknames'], self.t1_players)
		# self.assertEqual(response_data['organizer'], self.user1.id)
		# self.assertEqual(response.status_code, 200)
		self.assertEqual(response.status_code, 401)

	def test_access_by_other_user(self):
		"""他のユーザーがトーナメントデータにアクセスした際に適切にアクセスを制限するか"""
		self.__logout()  # 入り直し
		self.__login(email='testuser2@example.com', password='223alks;d;fjsakd45abcde')
		response = self.client.get(reverse('get_tournament_data_by_id', kwargs={'tournament_id': self.tournament1.id}))
		response_data = response.json()
		self.assertEqual(response_data['id'], self.tournament1.id)
		self.assertEqual(response_data['name'], self.t1_name)
		self.assertEqual(response_data['player_nicknames'], self.t1_players)
		self.assertEqual(response_data['organizer'], self.user1.id)
		self.assertEqual(response.status_code, 200) 

	def test_tournament_data_not_found(self):
		"""存在しないトーナメントIDでアクセスした場合に404が返されるかテスト"""
		response = self.client.get(reverse('get_tournament_data_by_id', kwargs={'tournament_id': 999999}))
		self.assertEqual(response.status_code, 404)

	def test_tournament_data_wrong_method(self):
		"""不正なリクエストメソッドでアクセスした場合に405が返されるかテスト"""
		response = self.client.post(reverse('get_tournament_data_by_id', kwargs={'tournament_id': self.tournament1.id}))
		self.assertEqual(response.status_code, 405)
