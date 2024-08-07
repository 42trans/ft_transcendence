from . import *


class ProfileTest(TestConfig):
    def setUp(self):
        super().setUp()  # login, top page遷移まで実行

        self.nickname = self._generate_random_string(20)
        self.email = f"{self.nickname}@example.com"
        self.password = "pass0123"

        self._create_new_user(email=self.email,
                              nickname=self.nickname,
                              password=self.password)
        self._login(self.email, self.password)
        self._move_top_to_profile()

    ############################################################################

    def test_access_profile(self):
        self._assert_current_url(self.profile_url)

    def test_profile_page(self):
        # emailの表示を検証
        expected_email = self.email
        self._assert_profile_email(expected_email)

        # nicknameの表示を検証
        expected_nickname = self.nickname
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
        prev_nickname = self.nickname
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
        current_nickname = self.nickname

        invalid_nicknames_and_expected_messages = [
            # current nickname
            {"nickname": current_nickname,  "message": "new nickname same as current"},

            # すでに使用されているnickname
            {"nickname": "user2",           "message": "This nickname is already in use"},


            # 不正なnickname
            {"nickname": "nick_name",       "message": "Invalid nickname format"},
            {"nickname": "nick name",       "message": "Invalid nickname format"},
            {"nickname": "***",             "message": "Invalid nickname format"},
            {"nickname": "   aaa",          "message": "Invalid nickname format"},
            {"nickname": "<script>alert('x')</script>",  "message": f"Invalid nickname format"},

            # multi-byte
            {"nickname": "ニックネーム",      "message": "The nickname can only contain ASCII characters"},

            # too short
            {"nickname": "n",               "message": f"The nickname must be at least {CustomUser.kNICKNAME_MIN_LENGTH} characters"},
            {"nickname": "ng",              "message": f"The nickname must be at least {CustomUser.kNICKNAME_MIN_LENGTH} characters"},
            {"nickname": " ",               "message": f"The nickname must be at least {CustomUser.kNICKNAME_MIN_LENGTH} characters"},

            # too long
            {"nickname": "<script>alert('hello')</script>",  "message": f"The nickname must be {CustomUser.kNICKNAME_MAX_LENGTH} characters or less"},
            {"nickname": f"{'a' * 31}",     "message": f"The nickname must be {CustomUser.kNICKNAME_MAX_LENGTH} characters or less"},
            {"nickname": f"{' ' * 31}",     "message": f"The nickname must be {CustomUser.kNICKNAME_MAX_LENGTH} characters or less"},
            {"nickname": f"{'a' * 1024}",   "message": f"The nickname must be {CustomUser.kNICKNAME_MAX_LENGTH} characters or less"},
            {"nickname": f"{'a' * 8096}",   "message": f"The nickname must be {CustomUser.kNICKNAME_MAX_LENGTH} characters or less"},
        ]

        print(f"[Testing] invalid nickname")
        for invalid_data in invalid_nicknames_and_expected_messages:
            invalid_nickname = invalid_data["nickname"]
            expected_message = invalid_data["message"]
            print(f" nickname: [{invalid_nickname}]")

            self._edit_nickname(invalid_nickname, wait_for_button_invisible=False)
            self._assert_message(expected_message)
            self._assert_current_url(self.edit_profile_url)

        # nicknameはuser1から不変のはず
        self._move_top_to_profile()
        self._assert_profile_nickname(current_nickname)

    def test_edit_password_success(self):
        """
        passwordの変更テスト
         - user1でlogin
         - passwordの変更
         - logout -> new passwordでlogin && profileがuser1であることを評価
         - 後続のテストのためにpasswordを元に戻す
        """
        self._move_to_edit_page()

        # passwordを変更
        old_pass = "pass0123"
        new_pass = "0123pass"
        self._edit_password(old_pass, new_pass, wait_for_button_invisible=True)
        self._assert_current_url(self.profile_url)

        # logout
        self._logout()

        # new passwordでlogin
        self._move_top_to_login()
        user1_email = self.email
        self._login(user1_email, new_pass)

        # user1であることを評価
        self._move_top_to_profile()
        self.test_profile_page()

        # old passwordに戻す
        self._move_to_edit_page()
        self._edit_password(new_pass, old_pass, wait_for_button_invisible=True)
        self._assert_current_url(self.profile_url)

    def test_edit_password_failure(self):
        """
        passwordの変更失敗を評価
         - current passwordが不正
         - new passwordがcurrent passwordと同一
         - new passwordが不正
        """
        self._move_to_edit_page()

        current_password = self.password
        invalid_new_passwords_and_expected_messages = [
            # current passwordと同一
            {"new_password": current_password,  "message": "new password same as current"},

            # 不正なpassword
            {"new_password": "パスワード123",    "message": "The password can only contain ASCII characters"},
            {"new_password": "パスワード",       "message": "The password can only contain ASCII characters"},

            # too common
            {"new_password": "password",        "message": "このパスワードは一般的すぎます。"},
            {"new_password": "********",        "message": "このパスワードは一般的すぎます。"},

            # too short
            {"new_password": "***4567",         "message": "このパスワードは短すぎます。最低 8 文字以上必要です。"},
            {"new_password": "a1",              "message": "このパスワードは短すぎます。最低 8 文字以上必要です。"},

            # too long
            {"new_password": f"{"pass0" + "0123456789" * 6}",   "message": f"The password must be {CustomUser.kPASSWORD_MAX_LENGTH} characters or less"},
            {"new_password": f"{"pass0" + "0123456789" * 128}", "message": f"The password must be {CustomUser.kPASSWORD_MAX_LENGTH} characters or less"},
        ]
        print(f"[Testing] invalid password")
        for invalid_data in invalid_new_passwords_and_expected_messages:
            invalid_new_password = invalid_data["new_password"]
            expected_message = invalid_data["message"]
            print(f" new_password: [{invalid_new_password}]")

            self._edit_password(current_password, invalid_new_password, wait_for_button_invisible=False)
            self._assert_message(expected_message)
            self._assert_current_url(self.edit_profile_url)

        # current passwordが不正
        wrong_current_pass = current_password + 'a'
        new_pass = "0123pass"
        self._edit_password(wrong_current_pass, new_pass, wait_for_button_invisible=False)
        self._assert_message("Current password is incorrect")
        self._assert_current_url(self.edit_profile_url)
        # self._screenshot("edit_pass_1")

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

    def _edit_password(self, current_password, new_password, wait_for_button_invisible):
        self._send_to_elem(By.ID, "current_password", current_password)
        self._send_to_elem(By.ID, "new_password", new_password)
        update_password_button = self._element(By.CSS_SELECTOR, "#password-form button[type='submit']")
        self._click_button(update_password_button, wait_for_button_invisible)
