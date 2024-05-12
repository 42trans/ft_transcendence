# docker/srcs/uwsgi-django/pong/tournament/tests/test_tour_create.py
from django.test import TestCase, Client
from django.urls import reverse
from ...models import Tournament, Match
import json
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status


class TestTourCreate(TestCase):
	def setUp(self):
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

	def __login(self, email, password):
		login_api_url = reverse('api_accounts:api_login')
		login_data = {'email': email, 'password': password}
		response = self.client.post(login_api_url, data=login_data)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

	def __logout(self):
		logout_api_url = reverse('api_accounts:api_logout')
		self.client.get(logout_api_url)

	def test_tournament_create_valid_data(self):
		"""有効なリクエスト"""
		response = self.client.post(reverse('create_new_tournament_and_matches'), {
			'name': 'New Tournament',
			'date': timezone.now().isoformat(),
			# 'date': timezone.now().isoformat(timespec='minutes'),
			'player_nicknames': json.dumps(['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'])
		})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(Tournament.objects.count(), 1)
		self.assertEqual(Match.objects.count(), 7)

	def test_tournament_create_valid_data(self):
		"""ニックネームが重複"""
		response = self.client.post(reverse('create_new_tournament_and_matches'), {
			'name': 'New Tournament',
			'date': timezone.now().isoformat(),
			# 'date': timezone.now().isoformat(timespec='minutes'),
			'player_nicknames': json.dumps(['sameName1', 'sameName1', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'])
		})
		self.assertEqual(response.status_code, 400)

	def test_tournament_create_invalid_date_format(self):
		"""日付が不正"""
		response = self.client.post(reverse('create_new_tournament_and_matches'), {
			'name': 'New Tournament',
			  # 不正な形式
			'date': '2024-12-01 14:00',
			'player_nicknames': json.dumps(['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'])
		})
		self.assertEqual(response.status_code, 400)

	def test_tournament_create_no_name(self):
		"""名前が空"""
		response = self.client.post(reverse('create_new_tournament_and_matches'), {
			# 名前がない
			'name': '',
			'date': timezone.now().isoformat(),
			'player_nicknames': json.dumps(['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'])
		})
		self.assertEqual(response.status_code, 400)

	def test_tournament_create_seven_nicknames(self):
		"""ニックネームが7名"""
		response = self.client.post(reverse('create_new_tournament_and_matches'), {
			'name': 'New Tournament',
			'date': timezone.now().isoformat(),
			'player_nicknames': json.dumps(['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7'])  # 7名のみ
		})
		self.assertEqual(response.status_code, 400)

	def test_tournament_create_empty_strings(self):
		"""ニックネームが空文字列"""
		response = self.client.post(reverse('create_new_tournament_and_matches'), {
			'name': 'New Tournament',
			'date': timezone.now().isoformat(),
			# 空文字列を含む
			'player_nicknames': json.dumps(['Player1', '', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'])
		})
		self.assertEqual(response.status_code, 400)

	def test_tournament_create_random_matching(self):
		"""ランダムマッチングのテスト"""
		player_nicknames = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8']
		response = self.client.post(reverse('create_new_tournament_and_matches'), {
			'name': 'Random Tournament',
			'date': timezone.now().isoformat(),
			'player_nicknames': json.dumps(player_nicknames),
			'randomize': True
		})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(Tournament.objects.count(), 1)
		self.assertEqual(Match.objects.count(), 7)
		self.assertEqual(Match.objects.filter(round_number=1).count(), 4)

		# ユニークな人数がnickname登録数と同じか
		# set: 重複不可
		all_players = set()
		# 全試合のプレイヤー1とプレイヤー2を追加していく。setなので重複登録はされない
		for match in Match.objects.filter(round_number=1):
			all_players.add(match.player1)
			all_players.add(match.player2)
		self.assertEqual(len(all_players), len(player_nicknames), "Some players are repeated in the first round.")

		# 各プレイヤーが第1ラウンドで1回だけ登場するかを確認
		player_counts = {}
		for match in Match.objects.filter(round_number=1):
			if match.player1 in player_counts:
				player_counts[match.player1] += 1
			else:
				player_counts[match.player1] = 1
			if match.player2 in player_counts:
				player_counts[match.player2] += 1
			else:
				player_counts[match.player2] = 1

		# すべてのプレイヤーがちょうど1回のみ登場しているか確認
		for player, count in player_counts.items():
			self.assertEqual(count, 1, f"Player {player} appears {count} times in the first round, which should not happen.")

	def test_create_by_unautholized_user(self):
		"""未認証のuserによるリクエスト"""
		self.__logout()
		response = self.client.post(reverse('create_new_tournament_and_matches'), {
			'name': 'New Tournament',
			'date': timezone.now().isoformat(),
			# 'date': timezone.now().isoformat(timespec='minutes'),
			'player_nicknames': json.dumps(['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'])
		})
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
