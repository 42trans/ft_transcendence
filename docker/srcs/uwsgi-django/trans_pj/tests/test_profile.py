from . import *


class ProfileTest(TestConfig):
    def setUp(self):
        super().setUp()  # login, top page遷移まで実行
        self._login_user1_from_top_page()
        self._move_top_to_profile()

    ############################################################################

    def test_access_profile(self):
        self._assert_current_url(self.profile_url)

    def test_profile_page(self):
        # emailの表示を検証
        expected_email = "user1@example.com"
        self._assert_profile_email(expected_email)

        # nicknameの表示を検証
        expected_nickname = "user1"
        self._assert_profile_nickname(expected_nickname)

    def test_edit_profile_page(self):
        # access
        self._move_to_edit_page()

        # form
        self._assert_element(By.ID, "nickname", is_displayed=True)
        self._assert_element(By.ID, "current_password", is_displayed=True)
        self._assert_element(By.ID, "new_password", is_displayed=True)
        # self._screenshot("edit_profile1")

    def test_edit_nickname_success(self):
        self._move_to_edit_page()

        # user1 -> user12345
        new_nickname = "user12345"
        self._edit_nickname(new_nickname, wait_for_button_invisible=True)
        self._assert_profile_nickname(new_nickname)
        self._assert_current_url(self.profile_url)
        # self._screenshot("edit_profile")

        self._move_to_edit_page()

        # user1 <- user12345 : 後続のテストのために戻す
        prev_nickname = "user1"
        self._edit_nickname(prev_nickname, wait_for_button_invisible=True)
        self._assert_profile_nickname(prev_nickname)

    def test_edit_nickname_failure(self):
        """
        nicknameの変更失敗を評価
         - 現在のnickname
         - すでに使用されているnickname
         - 長すぎるnickname
         - 不正な文字列
        """
        self._move_to_edit_page()

        # user1 -> user1
        current_nickname = "user1"
        self._edit_nickname(current_nickname, wait_for_button_invisible=False)
        self._assert_message("new nickname same as current")
        self._assert_current_url(self.edit_profile_url)
        # self._screenshot("edit_nickname_1")

        # user1 -> user2
        already_use_nickname = "user2"
        self._edit_nickname(already_use_nickname, wait_for_button_invisible=False)
        # self._screenshot("edit_nickname_2-1")
        self._assert_message("This nickname is already in use")
        self._assert_current_url(self.edit_profile_url)
        # self._screenshot("edit_nickname_2")

        # user1 -> too long nickname
        too_long_nickname = "a" * (self.nickname_max_len + 1)
        self._edit_nickname(too_long_nickname, wait_for_button_invisible=False)
        self._assert_message(f"The nickname must be {self.nickname_max_len} characters or less")
        self._assert_current_url(self.edit_profile_url)
        # self._screenshot("edit_nickname_3")

        # user1 -> invalid nickname format
        invalid_nickname = "SP in nickname"
        self._edit_nickname(invalid_nickname, wait_for_button_invisible=False)
        self._assert_message("Invalid nickname format")
        self._assert_current_url(self.edit_profile_url)
        # self._screenshot("edit_nickname_4")

        # nicknameはuser1から不変のはず
        self._move_top_to_profile()
        self._assert_profile_nickname(current_nickname)

    ############################################################################

    def _assert_profile_email(self, expected_email):
        actual_email = self._element(By.CSS_SELECTOR, "#user-info li:nth-child(1)").text
        self.assertEqual(f"Email: {expected_email}", actual_email)

    def _assert_profile_nickname(self, expected_nickname):
        actual_nickname = self._element(By.CSS_SELECTOR, "#user-info li:nth-child(2)").text
        self.assertEqual(f"Nickname: {expected_nickname}", actual_nickname)

    def _move_to_edit_page(self):
        edit_link = self._text_link("Edit Profile")
        self._click_link(edit_link)
        self._assert_current_url(self.edit_profile_url)

    def _edit_nickname(self, new_nickname, wait_for_button_invisible):
        self._send_to_elem(By.ID, "nickname", new_nickname)
        update_nickname_button = self._element(By.CSS_SELECTOR, "#nickname-form button[type='submit']")
        self._click_button(update_nickname_button, wait_for_button_invisible)
