from . import *


class TopPageTest(TestConfig):
    def test_top_page(self):
        self._assert_page_url_and_title(expecter_url=self.top_url,
                                        expected_title='PongTop')
        # self._screenshot("top_page")

        # link
        actual_free_play_url = self._text_link_url("Free-Play")
        expected_free_play_url = self.free_game_url
        self.assertEqual(actual_free_play_url, expected_free_play_url)
