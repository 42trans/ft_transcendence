# docker/srcs/uwsgi-django/pong/tournament/tests/test_tournament_data.py
from django.test import TestCase, Client
from django.urls import reverse
from ...models import Tournament
from django.contrib.auth import get_user_model
from django.utils import timezone

class TestListAllUserTournaments(TestCase):
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
			# id フィールドが自動的に割り当て
			name="Example Tournament2",
			date=timezone.now() - timezone.timedelta(days=1),
			player_nicknames=['player11', 'player22', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user,
			is_finished=False
		)
		self.tournament3 = Tournament.objects.create(
			# id フィールドが自動的に割り当て
			name="Example Tournament3",
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

	def test_list_all_tournaments_success(self):
		""" 全てのトーナメントデータが正しく取得できるかテスト """
		response = self.client.get(reverse('get_history_all_user_tournaments'))
		self.assertEqual(response.status_code, 200)
		tournaments = response.json()
		self.assertEqual(len(tournaments), 2)
		# Test some data points
		self.assertIn('Example Tournament1', [t['name'] for t in tournaments])
		self.assertIn('Example Tournament2', [t['name'] for t in tournaments])

	def test_unauthenticated_access(self):
		""" 認証されていないユーザーが正しく取得できるかテスト """
		self.client.logout()
		response = self.client.get(reverse('get_history_all_user_tournaments'))
		self.assertNotEqual(response.status_code, 200)

	def test_wrong_method_access(self):
		""" 不正なリクエストメソッド(POST)でアクセスした場合に405が返されるかテスト """
		response = self.client.post(reverse('get_history_all_user_tournaments'))
		self.assertEqual(response.status_code, 405)

	def test_tournaments_of_other_users_not_listed(self):
		"""他のユーザーが主催するトーナメントがリストに含まれていないことを確認"""
		self.client.login(
			email='testuser2@example.com', 
			password='223alks;d;fjsakd45abcde')
		response = self.client.get(reverse('get_history_all_user_tournaments'))
		self.assertEqual(response.status_code, 200)
		tournaments = response.json()
		self.assertEqual(len(tournaments), 1)
		self.assertNotIn('Example Tournament1', [t['name'] for t in tournaments])
		self.assertNotIn('Example Tournament2', [t['name'] for t in tournaments])
		self.assertIn('Example Tournament3', [t['name'] for t in tournaments])

	def test_includes_finished_tournaments(self):
		"""ユーザーが主催した終了したトーナメントも含まれていることを確認"""
		# トーナメント2を終了状態に更新
		self.tournament2.is_finished = True
		self.tournament2.save()
		response = self.client.get(reverse('get_history_all_user_tournaments'))
		self.assertEqual(response.status_code, 200)
		tournaments = response.json()
		self.assertEqual(len(tournaments), 2)
		self.assertIn('Example Tournament1', [t['name'] for t in tournaments])
		self.assertIn('Example Tournament2', [t['name'] for t in tournaments])

	def test_no_tournaments_available(self):
		"""トーナメントが一つもない場合に空のリストが返されることを確認"""
		Tournament.objects.all().delete()
		response = self.client.get(reverse('get_history_all_user_tournaments'))
		self.assertEqual(response.status_code, 200)
		tournaments = response.json()
		self.assertEqual(len(tournaments), 0)

