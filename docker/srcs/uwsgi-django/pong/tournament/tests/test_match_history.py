from django.test import TestCase, Client
from django.urls import reverse
from ...models import Tournament, Match
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status
from django.test import override_settings

@override_settings(SECURE_SSL_REDIRECT=False)
class TestGetMatchHistory(TestCase):
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
			name="Example Tournament1",
			date=timezone.now(),
			player_nicknames=['TestUser1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user,
			is_finished=False
		)
		self.tournament2 = Tournament.objects.create(
			name="Example Tournament2",
			date=timezone.now() - timezone.timedelta(days=1),
			player_nicknames=['TestUser1', 'player22', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user,
			is_finished=False
		)
		self.tournament3 = Tournament.objects.create(
			name="Example Tournament3",
			date=timezone.now() - timezone.timedelta(days=1),
			player_nicknames=['TestUser2', 'player22', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user2,
			is_finished=False
		)

		self.match1 = Match.objects.create(
			tournament=self.tournament1,
			round_number=1,
			match_number=1,
			player1='TestUser1',
			player2='player2',
			winner='TestUser1',
			is_finished=True,
			ended_at=timezone.now(),
			player1_score=11,
			player2_score=7
		)
		self.match2 = Match.objects.create(
			tournament=self.tournament2,
			round_number=1,
			match_number=2,
			player1='player3',
			player2='TestUser1',
			winner='player3',
			is_finished=True,
			ended_at=timezone.now() - timezone.timedelta(days=1),
			player1_score=11,
			player2_score=9
		)

		self.client = Client()
		self.__login(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
		)

	def __login(self, email, password):
		login_api_url = reverse('api_accounts:api_login')
		login_data = {'email': email, 'password': password}
		response = self.client.post(login_api_url, data=login_data, follow=True)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

	def __logout(self):
		logout_api_url = reverse('api_accounts:api_logout')
		self.client.get(logout_api_url)

	def test_get_match_history(self):
		response = self.client.get(reverse('get_match_history'))
		self.assertEqual(response.status_code, 200)
		response_data = response.json()
		
		print(response_data)
		self.assertEqual(len(response_data['matches']), 2)
		self.assertEqual(response_data['matches'][0]['player1'], 'You')
		self.assertEqual(response_data['matches'][0]['player2'], 'player2')
		self.assertEqual(response_data['matches'][1]['player1'], 'player3')
		self.assertEqual(response_data['matches'][1]['player2'], 'You')

		self.assertEqual(response_data['stats']['total_matches'], 2)
		self.assertEqual(response_data['stats']['wins'], 1)
		self.assertEqual(response_data['stats']['losses'], 1)
		self.assertEqual(response_data['stats']['win_rate'], 0.5)
		self.assertEqual(response_data['stats']['avg_points_scored'], 10.0)
		self.assertEqual(response_data['stats']['avg_points_lost'], 9.0)

	def test_unauthenticated_access(self):
		self.__logout()
		response = self.client.get(reverse('get_match_history'))
		self.assertEqual(response.status_code, 401)

	def test_wrong_method_access(self):
		response = self.client.post(reverse('get_match_history'))
		self.assertEqual(response.status_code, 405)