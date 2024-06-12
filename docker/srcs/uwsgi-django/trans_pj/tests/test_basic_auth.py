from . import *


class BasicAuthTest(TestConfig):
    def setUp(self):
        super().setUp()

        self.nickname = self._generate_random_string(20)
        self.email = f"{self.nickname}@example.com"
        self.password = "pass0123"

        self._create_new_user(email=self.email,
                              nickname=self.nickname,
                              password=self.password)

    def test_login_page(self):
        """
        login pageの評価
        """
        # self._screenshot("login1")
        self._move_top_to_login()

        # self._screenshot("login2")
        # フォームの要素の検証 ####################################################
        self._assert_element(By.ID, "email", is_displayed=True)
        self._assert_element(By.ID, "password", is_displayed=True)
        self._assert_element(By.ID, "login-btn", is_displayed=True)

        # "Log in to your 42 account" リンク先URLの検証 ##########################
        actual_42auth_url = self._text_link_url("Log in to your 42 account")
        expected_42auth_url = self.oauth_url
        self.assertEqual(actual_42auth_url, expected_42auth_url)

        # "Create an Account" リンク先URLの検証 ##################################
        actual_create_account_url = self._text_link_url("Create an Account")
        expected_create_account_url = self.signup_url
        self.assertEqual(actual_create_account_url, expected_create_account_url)

    def test_login_success(self):
        """
        login成功
        """

        self._move_top_to_login()

        self._login(self.email, self.password)
        self._assert_current_url(self.top_url)
        # self._screenshot("login success")

    def test_login_failure(self):
        """
        login失敗
        """
        self._move_top_to_login()

        wrong_email = 'nothing@example.com'
        password = self.password

        self._login(wrong_email, password, wait_for_button_invisible=False)
        self._assert_current_url(self.login_url)
        self._assert_message("Invalid credentials")
        # self._screenshot("login failure")

    def test_logout(self):
        self._login(self.email, self.password)

        self._logout()
        self._assert_current_url(self.top_url)

    def test_signup_page(self):
        self._move_top_to_signup()

        # フォームの要素の検証 ####################################################
        self._assert_element(By.ID, "email", is_displayed=True)
        self._assert_element(By.ID, "nickname", is_displayed=True)
        self._assert_element(By.ID, "password1", is_displayed=True)
        self._assert_element(By.ID, "password2", is_displayed=True)

        # "Signing up for a 42 account" リンク先URLの検証 ########################
        actual_42auth_url = self._text_link_url("Signing up for a 42 account")
        expected_42auth_url = self.oauth_url
        self.assertEqual(actual_42auth_url, expected_42auth_url)

        # "Login here" リンク先URLの検証 #########################################
        actual_login_here_url = self._text_link_url("Login here")
        expected_login_here_url = self.login_url
        self.assertEqual(actual_login_here_url, expected_login_here_url)

    def test_signup_success(self):
        self._move_top_to_signup()

        nickname = self._generate_random_string()  # 重複防止のためランダムに作成
        email = f"{nickname}@example.com"
        password1 = "pass0123"
        password2 = "pass0123"

        self._signup(email,
                     nickname,
                     password1,
                     password2,
                     wait_for_button_invisible=True)
        self._assert_current_url(self.top_url)

    def test_signup_invalid_email(self):
        """
        不正なemailでsign up失敗を検証
         - すでに存在するemail
         - 不正なemail
         - min lengthよりも短いemail
         - max lengthよりも長いemail
        ※ 空文字列はform送信不可のため除外
        """
        self._move_top_to_signup()

        invalid_emails_and_expected_messages = [
            # すでに存在するemail
            {"email": self.email,             "message": "This email is already in use"},

            # 不正なemail
            {"email": "invalid-email.com",    "message": "有効なメールアドレスを入力してください。"},
            {"email": "invalid.@email.com",   "message": "有効なメールアドレスを入力してください。"},
            {"email": "invalid@email",        "message": "有効なメールアドレスを入力してください。"},
            {"email": "invalid@email..com",   "message": "有効なメールアドレスを入力してください。"},
            {"email": "invalid@email@co.jp",  "message": "有効なメールアドレスを入力してください。"},
            {"email": "<script>alert('hello')</script>",  "message": "有効なメールアドレスを入力してください。"},
            {"email": "invalid @email.com",   "message": "有効なメールアドレスを入力してください。"},
            {"email": "invalid\t@email.com",  "message": "有効なメールアドレスを入力してください。"},
            {"email": "メール@email.com",      "message": "有効なメールアドレスを入力してください。"},
            {"email": "メールアドレス",         "message": "有効なメールアドレスを入力してください。"},

            # too short
            {"email": "a@b",                  "message": f"The email must be at least {CustomUser.kEMAIL_MIN_LENGTH} characters"},
            {"email": "a@bc",                 "message": f"The email must be at least {CustomUser.kEMAIL_MIN_LENGTH} characters"},
            {"email": " ",                    "message": f"The email must be at least {CustomUser.kEMAIL_MIN_LENGTH} characters"},
            {"email": "\t",                   "message": f"The email must be at least {CustomUser.kEMAIL_MIN_LENGTH} characters"},

            # too long
            {"email": f"a@{'b' * 64}.com",    "message": f"The email must be {CustomUser.kEMAIL_MAX_LENGTH} characters or less"},
            {"email": f"a@{'b' * 128}.com",   "message": f"The email must be {CustomUser.kEMAIL_MAX_LENGTH} characters or less"},
            {"email": f"a@{'b' * 256}.com",   "message": f"The email must be {CustomUser.kEMAIL_MAX_LENGTH} characters or less"},
            {"email": f"a@{'b' * 1024}.com",  "message": f"The email must be {CustomUser.kEMAIL_MAX_LENGTH} characters or less"},
            {"email": f"a@{'b' * 2048}.com",  "message": f"The email must be {CustomUser.kEMAIL_MAX_LENGTH} characters or less"},
            {"email": f"a@{'b' * 4096}.com",  "message": f"The email must be {CustomUser.kEMAIL_MAX_LENGTH} characters or less"},
            {"email": f"a@{'b' * 8192}.com",  "message": f"The email must be {CustomUser.kEMAIL_MAX_LENGTH} characters or less"},
        ]

        print(f"[Testing] invalid email")
        for invalid_data in invalid_emails_and_expected_messages:
            invalid_email = invalid_data["email"]
            expected_message = invalid_data["message"]
            # print(f" email: [{invalid_email}]")

            nickname = self._generate_random_string()
            password1 = "pass0123"
            password2 = "pass0123"

            self._signup(invalid_email,
                         nickname,
                         password1,
                         password2,
                         wait_for_button_invisible=False)
            self._assert_message(expected_message)
            self._assert_current_url(self.signup_url)

    def test_signup_invalid_nickname(self):
        """
        不正なnicknameでsign up失敗を検証
         - すでに存在するnickname
         - alnum以外が含まれるnickname
         - min lengthよりも短いnickname
         - max lengthよりも長いnickname
        """
        self._move_top_to_signup()

        invalid_nicknames_and_expected_messages = [
            # すでに存在するnickname
            {"nickname": self.nickname,     "message": "This nickname is already in use"},

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
            # print(f" nickname: [{invalid_nickname}]")

            email = f"{self._generate_random_string()}@example.com"
            password1 = "pass0123"
            password2 = "pass0123"

            self._signup(email,
                         invalid_nickname,
                         password1,
                         password2,
                         wait_for_button_invisible=False)
            self._assert_message(expected_message)
            self._assert_current_url(self.signup_url)

    def test_signup_invalid_password(self):
        """
        不正なpasswordでsign up失敗を検証
        """
        self._move_top_to_signup()

        # 不正なpassword
        new_email = "new_user@example.com"
        new_nickname = "newTestUser"
        password1 = "pass0123"
        password2 = "0123pass"

        self._signup(new_email,
                     new_nickname,
                     password1,
                     password2,
                     wait_for_button_invisible=False)
        self._assert_message("passwords don't match")
        self._assert_current_url(self.signup_url)

        # 不正なpassword（too long）
        new_email = "new_user@example.com"
        new_nickname = "newTestUser"
        password1 = "pass0" + "0123456789" * 6
        password2 = "pass0" + "0123456789" * 6

        self._signup(new_email,
                     new_nickname,
                     password1,
                     password2,
                     wait_for_button_invisible=False)
        self._assert_message(f"The password must be {CustomUser.kPASSWORD_MAX_LENGTH} characters or less")
        self._assert_current_url(self.signup_url)

    def _signup(self,
                email,
                nickname,
                password1,
                password2,
                wait_for_button_invisible):
        # self._screenshot("signup1")
        self._send_to_elem(By.ID, "email", email)
        self._send_to_elem(By.ID, "nickname", nickname)
        self._send_to_elem(By.ID, "password1", password1)
        self._send_to_elem(By.ID, "password2", password2)

        # self._screenshot("signup2")
        signup_button = self._element(By.ID, "sign-submit")
        self._click_button(signup_button, wait_for_button_invisible)
