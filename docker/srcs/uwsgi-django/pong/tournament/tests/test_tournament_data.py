# docker/srcs/uwsgi-django/pong/tournament/tests/test_tournament_data.py

from django.test import TestCase, Client
from django.urls import reverse
from ...models import Tournament
from django.contrib.auth import get_user_model
from django.utils import timezone

class TournamentData(TestCase):
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
			name="Example Tournament",
			date=timezone.now() - timezone.timedelta(days=1),
			player_nicknames=['player11', 'player22', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user,
			is_finished=False
		)
		self.tournament3 = Tournament.objects.create(
			# id フィールドが自動的に割り当て
			name="Example Tournament",
			date=timezone.now() - timezone.timedelta(days=1),
			player_nicknames=['player111', 'player22', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user2,
			is_finished=False
		)

		self.client = Client()
		self.client.login(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
		)

	def test_tournament_data_success(self):
		"""トーナメントデータが正しく取得できるかテスト"""
		response = self.client.get(reverse('tournament_data_id', kwargs={'tournament_id': self.tournament.id}))
		self.assertEqual(response.status_code, 200)
		response_data = response.json()
		self.assertEqual(response_data['id'], self.tournament.id)
		self.assertEqual(response_data['name'], self.tournament.name)
		self.assertEqual(response_data['organizer'], self.user.id)

	def test_unauthenticated_access(self):
		"""認証されていないユーザーが正しく取得できるかテスト"""
		self.client.logout()  # ユーザーをログアウト
		response = self.client.get(reverse('tournament_data_id', kwargs={'tournament_id': self.tournament.id}))
		response_data = response.json()
		self.assertEqual(response_data['id'], self.tournament.id)
		self.assertEqual(response_data['name'], self.tournament.name)
		self.assertEqual(response_data['organizer'], self.user.id)
		self.assertEqual(response.status_code, 200) 

	def test_access_by_other_user(self):
		"""他のユーザーがトーナメントデータにアクセスした際に適切にアクセスを制限するか"""
		self.client.logout()  # 入り直し
		self.client.login(email='testuser2@example.com', password='223alks;d;fjsakd45abcde')
		response = self.client.get(reverse('tournament_data_id', kwargs={'tournament_id': self.tournament.id}))
		response_data = response.json()
		self.assertEqual(response_data['id'], self.tournament.id)
		self.assertEqual(response_data['name'], self.tournament.name)
		self.assertEqual(response_data['organizer'], self.user.id)
		self.assertEqual(response.status_code, 200) 

	def test_tournament_data_not_found(self):
		"""存在しないトーナメントIDでアクセスした場合に404が返されるかテスト"""
		response = self.client.get(reverse('tournament_data_id', kwargs={'tournament_id': 999999}))
		self.assertEqual(response.status_code, 404)

	def test_tournament_data_wrong_method(self):
		"""不正なリクエストメソッドでアクセスした場合に405が返されるかテスト"""
		response = self.client.post(reverse('tournament_data_id', kwargs={'tournament_id': self.tournament.id}))
		self.assertEqual(response.status_code, 405)
		
	

