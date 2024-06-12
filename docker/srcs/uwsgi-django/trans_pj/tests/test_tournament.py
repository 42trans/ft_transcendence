import time

from . import *


class TournamentTest(TestConfig):
    def setUp(self):
        super().setUp()

        self.nickname = self._generate_random_string(20)
        self.email = f"{self.nickname}@example.com"
        self.password = "pass0123"

        self._create_new_user(email=self.email,
                              nickname=self.nickname,
                              password=self.password)
        self._login(self.email, self.password)
        self._move_top_to_tournament()

    def test_create_and_delete_tournament(self):
        self._is_tournament_top()
        # self._screenshot("tournament1")
        self._submit_tournament()
        # self._screenshot("tournament2")
        self._is_progress()
        # self._screenshot("tournament3")
        self._delete_tournament()
        # self._screenshot("tournament4")
        self._is_tournament_top()

    def test_invalid_tournament_name(self):
        self._is_tournament_top()

        invalid_tournament_name_and_expected_messages = [
            # empty
            {"name": "",                "message": "Tournament name is required."},

            # invalid character
            {"name": "トーナメント",      "message": "Error: Invalid tournament_name: non-empty alnum 3-30 length name required."},
            {"name": " ",               "message": "Error: Invalid tournament_name: non-empty alnum 3-30 length name required."},
            {"name": ".",               "message": "Error: Invalid tournament_name: non-empty alnum 3-30 length name required."},
            {"name": "abc*012",         "message": "Error: Invalid tournament_name: non-empty alnum 3-30 length name required."},
            {"name": "abc_012",         "message": "Error: Invalid tournament_name: non-empty alnum 3-30 length name required."},
            {"name": "abc\t012",        "message": "Error: Invalid tournament_name: non-empty alnum 3-30 length name required."},
            {"name": "<script>alert('a')</script>",        "message": "Error: Invalid tournament_name: non-empty alnum 3-30 length name required."},

            # too short
            {"name": "a",               "message": "Error: Invalid tournament_name: non-empty alnum 3-30 length name required."},
            {"name": "aa",              "message": "Error: Invalid tournament_name: non-empty alnum 3-30 length name required."},
            {"name": "  aa  ",          "message": "Error: Invalid tournament_name: non-empty alnum 3-30 length name required."},

            # too long
            {"name": f"{'a' * 31}",     "message": "Error: Invalid name: この値は 30 文字以下でなければなりません( 31 文字になっています)。"},
            {"name": f"{'a' * 8192}",   "message": "Error: Invalid name: この値は 30 文字以下でなければなりません( 8192 文字になっています)。"},
            {"name": "<script>alert('hello')</script>",   "message": "Error: Invalid name: この値は 30 文字以下でなければなりません( 31 文字になっています)。"},
        ]

        print(f"[Testing] invalid tournament name")
        for invalid_data in invalid_tournament_name_and_expected_messages:
            invalid_tournament_name = invalid_data["name"]
            expected_message = invalid_data["message"]
            print(f" tournament name: [{invalid_tournament_name}]")

            self._send_to_elem(By.CSS_SELECTOR, 'input[name="name"]', invalid_tournament_name)
            # self._screenshot("invalid1")
            self._submit_tournament(wait_invisible=False)
            # self._screenshot("invalid2")
            self._assert_message(expected_message, value="error-message")
            self._is_tournament_top()

    def test_invalid_player_name(self):
        self._is_tournament_top()

        invalid_player_name_and_expected_messages = [
            # empty
            {"name": "",                "message": "All 8 nicknames are required."},
            {"name": " ",               "message": "All 8 nicknames are required."},

            # same as user
            {"name": self.nickname,    "message": "Error: Invalid player_nicknames: 8 unique, non-empty alnum, 3-30 length nicknames required."},

            # invalid character
            {"name": "ニックネーム",      "message": "Error: Invalid player_nicknames: 8 unique, non-empty alnum, 3-30 length nicknames required."},
            {"name": ".",               "message": "Error: Invalid player_nicknames: 8 unique, non-empty alnum, 3-30 length nicknames required."},
            {"name": "abc*012",         "message": "Error: Invalid player_nicknames: 8 unique, non-empty alnum, 3-30 length nicknames required."},
            {"name": "abc_012",         "message": "Error: Invalid player_nicknames: 8 unique, non-empty alnum, 3-30 length nicknames required."},
            {"name": "<script>alert('a')</script>",         "message": "Error: Invalid player_nicknames: 8 unique, non-empty alnum, 3-30 length nicknames required."},

            # too short
            {"name": "a",               "message": "Error: Invalid player_nicknames: 8 unique, non-empty alnum, 3-30 length nicknames required."},
            {"name": "aa",              "message": "Error: Invalid player_nicknames: 8 unique, non-empty alnum, 3-30 length nicknames required."},
            {"name": "  aa  ",          "message": "Error: Invalid player_nicknames: 8 unique, non-empty alnum, 3-30 length nicknames required."},

            # too long
            {"name": f"{'a' * 31}",     "message": "Error: Invalid player_nicknames: Item 2 in the array did not validate: この値は 30 文字以下でなければなりません( 31 文字になっています)。"},
            {"name": f"{'a' * 8192}",   "message": "Error: Invalid player_nicknames: Item 2 in the array did not validate: この値は 30 文字以下でなければなりません( 8192 文字になっています)。"},
            {"name": "<script>alert('hello')</script>",     "message": "Error: Invalid player_nicknames: Item 2 in the array did not validate: この値は 30 文字以下でなければなりません( 31 文字になっています)。"},
        ]

        print(f"[Testing] invalid player name")
        for invalid_data in invalid_player_name_and_expected_messages:
            invalid_player_name = invalid_data["name"]
            expected_message = invalid_data["message"]
            print(f" player name: [{invalid_player_name}]")

            self._send_to_elem(By.CSS_SELECTOR,  '.slideup-text.form-floating:nth-of-type(3) input[name="nickname"]', invalid_player_name)
            # self._screenshot("invalid_nickname_1")
            self._submit_tournament(wait_invisible=False)
            # self._screenshot("invalid_nickname_2")
            self._assert_message(expected_message, value="error-message")
            self._is_tournament_top()

    def _submit_tournament(self, wait_invisible=True):
        submit_button = self._button(By.CSS_SELECTOR, ".hth-btn.my-4")
        self.driver.execute_script("arguments[0].click();", submit_button)
        if wait_invisible:
            self._wait_invisible(submit_button)

    def _delete_tournament(self):
        delete_button = self._button(By.ID, "delete-button")
        self.driver.execute_script("arguments[0].click();", delete_button)
        self._close_alert("Delete this tournament?")

    def _is_tournament_top(self):
        """
        'Create Tournament'が表示されている場合はsign up pageとみなす
        """
        h1_element = self._element(
            by=By.CSS_SELECTOR,
            value="h2.slideup-text",
        )
        self.assertIn("Create Tournament", h1_element.text)

    def _is_progress(self):
        """
        'Tournament is in progress.'が表示されている場合はsign up pageとみなす
        """
        h1_element = self._element(
            by=By.CSS_SELECTOR,
            value="h2#overview-header",
        )
        self.assertIn("Tournament is in progress.", h1_element.text)
