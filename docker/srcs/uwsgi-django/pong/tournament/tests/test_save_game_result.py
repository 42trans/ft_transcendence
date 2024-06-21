import json
from django.test import TestCase, Client
from ...models import Tournament, Match
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.urls import reverse
from ...views.tournament.save_views import is_tournament_finished, is_round_finished, assign_winner_to_next_match
from django.test import override_settings
from rest_framework.test import APIClient
from rest_framework import status


@override_settings(SECURE_SSL_REDIRECT=False)
class TestSaveGameResult(TestCase):
	def setUp(self):
		self.players = ['Player1', 'Player2', 'Player3', 'Player4',
						'Player5', 'Player6', 'Player7', 'Player8']

		# テストユーザーを作成
		User = get_user_model()
		self.user = User.objects.create_user(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
			nickname='TestUser' 
		)
		self.client = Client()
		self.__login(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
		)

		self.tournament = Tournament.objects.create(
			name="Example Tournament",
			date=timezone.now(),
			player_nicknames=['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user,
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

	def create_matches(self, finished=False):
		round_numbers = [1, 1, 1, 1, 2, 2, 3]
		for i in range(7):
			Match.objects.create(
				tournament=self.tournament,
				round_number=round_numbers[i],
				match_number=(i % 4) + 1,
				player1=f'Player{i+1}',
				player2=f'Player{i+2}' if i < 6 else '',
				winner=f'Player{i+1}' if finished else None,
				is_finished=finished,
				can_start=(round_numbers[i] == 1)
			)

	def test_tournament_not_finished(self):
		# 全ての試合が終了していない状態でトーナメントの試合を作成
		self.create_matches(finished=False)
		self.assertFalse(is_tournament_finished(self.tournament))

	def test_tournament_finished(self):
		self.create_matches(finished=True)
		self.assertTrue(is_tournament_finished(self.tournament))

	def test_tournament_partially_finished(self):
		""" 最初の3試合のみ終了させる: 一部の試合が終了し、一部の試合が終了していない状態 """
		self.create_matches(finished=False)
		# 最初の3つの試合を取得
		matches = Match.objects.filter(tournament=self.tournament)[:3]
		# 取得した3つの試合に対して is_finished = True
		for match in matches:
			match.is_finished = True
			match.winner = match.player1
			match.save()

		self.assertFalse(is_tournament_finished(self.tournament))

	def test_save_game_result(self):
		self.create_matches(finished=False)
		match = Match.objects.first()
		data = {
			'match_id': match.id,
			'player1_score': 11,
			'player2_score': 9
		}
		client = APIClient()
		client.force_authenticate(user=self.user) 
		# self.client.force_login(self.user)
		response = self.client.post(reverse('save_game_result'), data=json.dumps(data), content_type='application/json')
		self.assertEqual(response.status_code, 200)
		match.refresh_from_db()
		self.assertTrue(match.is_finished)
		self.assertEqual(match.winner, match.player1)
		next_match = Match.objects.get(round_number=2, match_number=1)
		self.assertTrue(next_match.can_start)

	def test_assign_winner_to_next_match(self):
		self.create_matches(finished=False)
		match = Match.objects.first()
		match.is_finished = True
		match.winner = match.player1
		match.save()
		assign_winner_to_next_match(match, match.winner)
		next_match = Match.objects.get(round_number=2, match_number=1)
		self.assertEqual(next_match.player1, match.winner)

	def test_round_finished(self):
		self.create_matches(finished=False)
		matches = Match.objects.filter(round_number=1)
		for match in matches:
			match.is_finished = True
			match.winner = match.player1
			match.save()
		self.assertTrue(is_round_finished(self.tournament, 1))
		self.assertFalse(is_round_finished(self.tournament, 2))