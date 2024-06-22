from django.test import TestCase
from ...models import Tournament, Match
from django.contrib.auth import get_user_model
from django.utils import timezone
from ...views.tournament.save_views import is_tournament_finished

class TestSaveGameResult(TestCase):
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
				is_finished=finished
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