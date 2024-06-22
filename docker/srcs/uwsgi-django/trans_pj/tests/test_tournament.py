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
        self._move_to_create_tournament()
        # self._screenshot("tournament2")
        self._submit_tournament()
        # self._screenshot("tournament3")
        self._is_progress()
        # self._screenshot("tournament4")
        self._delete_tournament()
        # self._screenshot("tournament5")
        self._is_tournament_top()

    def test_valid_tournament_name(self):
        self._is_tournament_top()

        valid_tournament_names = [
            "aaa",
            "a a",
            "1 a",
            "abc",
            "       abc",       # -> abc
            "abc     ",         # -> abc
            "       abc     ",  # -> abc
            f"{'a' * 29}",
            f"{'a' * 30}",
        ]

        print(f"[Testing] valid tournament name")
        for tournament_name in valid_tournament_names:
            self._move_to_create_tournament()
            print(f" tournament name: [{tournament_name}]")

            self._send_to_elem(By.CSS_SELECTOR, 'input[name="name"]', tournament_name)
            # self._screenshot(f"valid_tournament-{tournament_name}-1")
            self._submit_tournament()
            # self._screenshot(f"valid_tournament-{tournament_name}-2")
            self._is_progress()
            # self._screenshot(f"valid_tournament-{tournament_name}-3")
            self._delete_tournament()
            # self._screenshot(f"valid_tournament-{tournament_name}-4")
            self._is_tournament_top()
            # self._screenshot(f"valid_tournament-{tournament_name}-5")

    def test_invalid_tournament_name(self):
        self._is_tournament_top()
        self._move_to_create_tournament()

        invalid_tournament_name_and_expected_messages = [
            # empty
            {"name": "",                "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},

            # invalid character
            {"name": "トーナメント",      "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},
            {"name": " ",               "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},
            {"name": ".",               "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},
            {"name": "abc*012",         "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},
            {"name": "abc_012",         "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},
            {"name": "  ab",            "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},
            {"name": "ab  ",            "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},
            {"name": "<script>alert('a')</script>",        "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},

            # too short
            {"name": "a",               "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},
            {"name": "aa",              "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},
            {"name": "  aa  ",          "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},

            # too long
            {"name": f"{'a' * 31}",     "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},
            {"name": f"{'a' * 8192}",   "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},
            {"name": "<script>alert('hello')</script>",   "message": "Tournament name must be a non-empty alphanumeric string between 3 and 30 characters long."},
        ]

        print(f"[Testing] invalid tournament name")
        for invalid_data in invalid_tournament_name_and_expected_messages:
            invalid_tournament_name = invalid_data["name"]
            expected_message = f"You cannot create: {invalid_data["message"]}"
            print(f" tournament name: [{invalid_tournament_name}]")

            self._send_to_elem(By.CSS_SELECTOR, 'input[name="name"]', invalid_tournament_name)
            # self._screenshot("invalid1")
            self._submit_tournament(wait_invisible=False)
            # self._screenshot("invalid2")
            # self._assert_message(expected_message, value="error-message")
            self._close_alert(expected_message)
            self._is_create_tournament_page()

    def test_invalid_player_name(self):
        self._is_tournament_top()
        self._move_to_create_tournament()

        invalid_player_name_and_expected_messages = [
            # empty
            {"name": "",                "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},
            {"name": " ",               "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},

            # same as user
            {"name": self.nickname,    "message": "All 8 nicknames must be unique."},

            # invalid character
            {"name": "ニックネーム",      "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},
            {"name": ".",               "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},
            {"name": "abc*012",         "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},
            {"name": "abc_012",         "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},
            {"name": "<script>alert('a')</script>",         "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},

            # too short
            {"name": "a",               "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},
            {"name": "aa",              "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},
            {"name": "  aa  ",          "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},

            # too long
            {"name": f"{'a' * 31}",     "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},
            {"name": f"{'a' * 8192}",   "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},
            {"name": "<script>alert('hello')</script>",     "message": "All 8 nicknames must be unique, non-empty alphanumeric strings between 3 and 30 characters long."},
        ]

        print(f"[Testing] invalid player name")
        for invalid_data in invalid_player_name_and_expected_messages:
            invalid_player_name = invalid_data["name"]
            expected_message = f"You cannot create: {invalid_data["message"]}"
            print(f" player name: [{invalid_player_name}]")

            self._send_to_elem(By.CSS_SELECTOR,  '.slideup-text.form-floating:nth-of-type(3) input[name="nickname"]', invalid_player_name)
            # self._screenshot("invalid_nickname_1")
            self._submit_tournament(wait_invisible=False)
            # self._screenshot("invalid_nickname_2")
            # self._assert_message(expected_message, value="error-message")
            self._close_alert(expected_message)
            self._is_create_tournament_page()

    def _move_to_create_tournament(self, wait_invisible=True):
        create_button = self._button(By.CSS_SELECTOR, ".slideup-text.hth-btn.my-3")
        self.driver.execute_script("arguments[0].click();", create_button)
        if wait_invisible:
            self._wait_invisible(create_button)

    def _submit_tournament(self, wait_invisible=True):
        submit_button = self._button(By.CSS_SELECTOR, ".hth-btn.my-4")
        self.driver.execute_script("arguments[0].click();", submit_button)
        if wait_invisible:
            self._wait_invisible(submit_button)

    def _delete_tournament(self):
        delete_button = self._button(By.ID, "delete-button")
        self.driver.execute_script("arguments[0].click();", delete_button)
        self._close_alert("Delete this tournament?")
        time.sleep(0.1)

    def _is_tournament_top(self):
        """
        'Welcome back!'が表示されている場合はsign up pageとみなす
        """
        h1_element = self._element(
            by=By.CSS_SELECTOR,
            value="h2.slideup-text",
        )
        self.assertIn("Welcome back!", h1_element.text)

    def _is_create_tournament_page(self):
        """
        'Welcome back!'が表示されている場合はsign up pageとみなす
        """
        h2_element = self._element(
            by=By.CSS_SELECTOR,
            value=".slideup-text.mb-3",
        )
        self.assertIn("Create Tournament", h2_element.text)

    def _is_progress(self):
        """
        'Tournament is in progress.'が表示されている場合はsign up pageとみなす
        """
        h1_element = self._element(
            by=By.CSS_SELECTOR,
            value="h2#overview-header",
        )
        self.assertIn("Tournament is in progress.", h1_element.text)
