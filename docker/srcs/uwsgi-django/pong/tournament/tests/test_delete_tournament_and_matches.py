from django.test import TestCase, Client
from django.urls import reverse
from ...models import Tournament, Match
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status


class TestDeleteTournament(TestCase):
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
		# 4試合
		for i in range(1, 5):
			Match.objects.create(
				tournament=self.tournament1,
				round_number=1,
				match_number=i,
				player1=f'Player{i}',
				# とりあえずの名前なのでi+1.assertEqual用
				player2=f'Player{i+1}',
				# ended_at=timezone.now()
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

	def test_delete_tournament_and_matches(self):
		"""トーナメントと関連する試合が削除されることを確認するテスト"""
		response = self.client.post(reverse('delete_tournament_and_matches', kwargs={'tournament_id': self.tournament1.id}))
		self.assertEqual(response.status_code, 200)
		self.assertFalse(Tournament.objects.filter(id=self.tournament1.id).exists())
		self.assertFalse(Match.objects.filter(tournament=self.tournament1).exists())
		response_data = response.json()
		self.assertEqual(response_data['message'], 'Tournament and related matches deleted successfully.')

	def test_delete_twice_tournament_and_matches(self):
		"""削除したトーナメントを再度削除"""
		# 削除
		delete_tournament_id = self.tournament1.id
		response = self.client.post(reverse('delete_tournament_and_matches', kwargs={'tournament_id': delete_tournament_id}))
		self.assertEqual(response.status_code, 200)
		self.assertFalse(Tournament.objects.filter(id=self.tournament1.id).exists())
		self.assertFalse(Match.objects.filter(tournament=self.tournament1).exists())
		response_data = response.json()
		self.assertEqual(response_data['message'], 'Tournament and related matches deleted successfully.')

		# 削除2回目
		response = self.client.post(reverse('delete_tournament_and_matches', kwargs={'tournament_id': delete_tournament_id}))
		self.assertEqual(response.status_code, 404)
		response_data = response.json()
		self.assertEqual(response_data['message'], 'Tournament not found.')

	def test_delete_finished_tournament(self):
		"""終了したトーナメントを削除しようとした場合のテスト"""
		self.tournament1.is_finished = True
		self.tournament1.save()
		response = self.client.post(reverse('delete_tournament_and_matches', kwargs={'tournament_id': self.tournament1.id}))
		self.assertEqual(response.status_code, 400)
		response_data = response.json()
		self.assertEqual(response_data['message'], 'Cannot delete finished tournaments.')

	def test_delete_nonexistent_tournament(self):
		"""存在しないトーナメントを削除しようとした場合のテスト"""
		response = self.client.post(reverse('delete_tournament_and_matches', kwargs={'tournament_id': 999}))
		self.assertEqual(response.status_code, 404)
		response_data = response.json()
		self.assertEqual(response_data['message'], 'Tournament not found.')

	def test_delete_by_unauthorized_user(self):
		"""未承認userによるリクエスト"""
		self.__logout()
		response = self.client.post(reverse('delete_tournament_and_matches', kwargs={'tournament_id': self.tournament1.id}))
		self.assertEqual(response.status_code, 401)
