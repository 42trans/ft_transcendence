from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from ...models import Tournament, Match
import json
from datetime import datetime
from django.contrib.auth import get_user_model
from django.utils import timezone

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
		self.client.login(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
	)


	def test_tournament_create_valid_data(self):
		"""有効なリクエスト"""
		response = self.client.post(reverse('tournament_create'), {
			'name': 'New Tournament',
			'date': timezone.now().isoformat(),
			# 'date': timezone.now().isoformat(timespec='minutes'),
			'player_nicknames': json.dumps(['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'])
		})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(Tournament.objects.count(), 1)
		self.assertEqual(Match.objects.count(), 7)

	def test_tournament_create_invalid_date_format(self):
		"""日付が不正"""
		response = self.client.post(reverse('tournament_create'), {
			'name': 'New Tournament',
			  # 不正な形式
			'date': '2024-12-01 14:00',
			'player_nicknames': json.dumps(['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'])
		})
		self.assertEqual(response.status_code, 400)

	def test_tournament_create_no_name(self):
		"""名前が空"""		
		response = self.client.post(reverse('tournament_create'), {
			# 名前がない
			'name': '',
			'date': timezone.now().isoformat(),			
			'player_nicknames': json.dumps(['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'])
		})
		self.assertEqual(response.status_code, 400)

	def test_tournament_create_seven_nicknames(self):
		"""ニックネームが7名"""
		response = self.client.post(reverse('tournament_create'), {
			'name': 'New Tournament',
			'date': timezone.now().isoformat(),
			'player_nicknames': json.dumps(['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7'])  # 7名のみ
		})
		self.assertEqual(response.status_code, 400)

	def test_tournament_create_empty_strings(self):
		"""ニックネームが空文字列"""
		response = self.client.post(reverse('tournament_create'), {
			'name': 'New Tournament',
			'date': timezone.now().isoformat(),
			# 空文字列を含む
			'player_nicknames': json.dumps(['Player1', '', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8'])
		})
		self.assertEqual(response.status_code, 400)