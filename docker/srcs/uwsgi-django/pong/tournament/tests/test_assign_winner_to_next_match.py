from django.test import TestCase
from ...models import Tournament, Match
from django.contrib.auth import get_user_model
from django.utils import timezone
from pong.views.tournament.save_views import assign_winner_to_next_match
from django.test import override_settings

@override_settings(SECURE_SSL_REDIRECT=False)
class TestAssignWinnerToNextMatch(TestCase):
	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(
			email='testuser@example.com',
			password='123alks;d;fjsakd45abcde',
			nickname='TestUser1'
		)
		
		self.tournament = Tournament.objects.create(
			name="Example Tournament",
			date=timezone.now(),
			player_nicknames=['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'],
			organizer=self.user,
			is_finished=False
		)

		self.matches = []  # マッチオブジェクトを格納するリスト
		for i in range(1, 5):
			match = Match.objects.create(
				tournament=self.tournament,
				round_number=1,
				match_number=i,
				player1=f'Player{i}',
				player2=f'Player{i+1}',
				winner=f'Player{i}' if i % 2 == 1 else f'Player{i+1}',
				is_finished=True,
				ended_at=timezone.now()
			)
			self.matches.append(match)  # リストに追加

		# 次回ラウンドの試合を設定
		self.next_round_match = Match.objects.create(
			tournament=self.tournament,
			round_number=2,
			match_number=1,
			player1='',
			player2='',
			is_finished=False
		)

	def test_assign_winner_to_next_match(self):
		# 第一試合の勝者を次のラウンドに割り当て
		assign_winner_to_next_match(self.matches[0], self.matches[0].winner)

		next_match = Match.objects.get(id=self.next_round_match.id)
		self.assertEqual(next_match.player1, self.matches[0].winner)
		self.assertEqual(next_match.player2, '')
		# まだ開始できない
		self.assertFalse(next_match.can_start)

		# 第二試合から勝者を次のラウンドに割り当て
		assign_winner_to_next_match(self.matches[1], self.matches[1].winner)

		next_match.refresh_from_db()
		self.assertEqual(next_match.player2, self.matches[1].winner)
		# 両プレイヤーが割り当てられたので開始可能
		self.assertTrue(next_match.can_start)

	def test_invalid_current_match(self):
		unfinished_match = Match.objects.create(
			tournament=self.tournament,
			round_number=1,
			match_number=1,
			player1='Player1',
			player2='Player2',
			is_finished=False,
			ended_at=timezone.now()
		)

		with self.assertRaises(ValueError):
			assign_winner_to_next_match(None, self.matches[0].winner)

		with self.assertRaises(ValueError):
			assign_winner_to_next_match('hoge', self.matches[0].winner)

		with self.assertRaises(ValueError):
			assign_winner_to_next_match(unfinished_match, 'Player1')

	def test_invalid_nickname(self):
		with self.assertRaises(ValueError):
			assign_winner_to_next_match(self.matches[0], None)

		with self.assertRaises(ValueError):
			assign_winner_to_next_match(self.matches[0], 'invalid user')
