from . import *


class TopPageTest(TestConfig):
    def test_guest_top_page(self):
        self._assert_page_url_and_title(expecter_url=self.top_url,
                                        expected_title='PongTop')
        # self._screenshot("top_page")

        # link
        actual_free_play_url = self._text_link_url("Free-Play")
        expected_free_play_url = self.free_game_url
        self.assertEqual(actual_free_play_url, expected_free_play_url)

    def test_user_top_link(self):
        self._login_user1_from_top_page()

        # link
        actual_free_play_url = self._text_link_url("Free-Play")
        expected_free_play_url = self.free_game_url
        self.assertEqual(actual_free_play_url, expected_free_play_url)

        actual_tournament_url = self._text_link_url("Tournament")
        expected_tournament_url = self.tournament_url
        self.assertEqual(actual_tournament_url, expected_tournament_url)

        actual_history_url = self._text_link_url("Game-History")
        expected_history_url = self.game_history_url
        self.assertEqual(actual_history_url, expected_history_url)

        actual_friend_url = self._text_link_url("Friend")
        expected_friend_url = self.friend_url
        self.assertEqual(actual_friend_url, expected_friend_url)

        actual_dm_url = self._text_link_url("DM")
        expected_dm_url = self.dm_url
        self.assertEqual(actual_dm_url, expected_dm_url)
