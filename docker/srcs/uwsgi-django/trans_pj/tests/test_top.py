from . import *


class TopPageTest(TestConfig):
    def test_top_page(self):
        self._assert_page_url_and_title(expecter_url=self.top_url,
                                        expected_title='PongTop')
        # self._screenshot("top_page")
