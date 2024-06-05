from . import *


class BasicAuthTest(TestConfig):
    def test_login_page(self):
        """
        login pageの評価
        """
        self._move_top_to_login()

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

        user1_email = 'user1@example.com'
        user1_password = 'pass0123'

        self._login(user1_email, user1_password)
        self._assert_current_url(self.top_url)
        # self._screenshot("login success")

    def test_login_failure(self):
        """
        login失敗
        """
        self._move_top_to_login()

        wrong_email = 'nothing@example.com'
        password = 'pass0123'

        self._login(wrong_email, password, wait_for_button_invisible=False)
        self._assert_current_url(self.login_url)
        self._assert_message("Invalid credentials")
        # self._screenshot("login failure")

    def test_logout(self):
        self._login_user1_from_top_page()

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

    def test_signup_failure(self):
        self._move_top_to_signup()

        # すでに存在するemail
        user1_email = "user1@example.com"
        nickname = self._generate_random_string()
        password1 = "pass0123"
        password2 = "pass0123"

        self._signup(user1_email,
                     nickname,
                     password1,
                     password2,
                     wait_for_button_invisible=False)
        self._assert_message("This email is already in use")
        self._assert_current_url(self.signup_url)

        # 不正なemail
        user1_email = "invalid-email.com"
        nickname = self._generate_random_string()
        password1 = "pass0123"
        password2 = "pass0123"

        self._signup(user1_email,
                     nickname,
                     password1,
                     password2,
                     wait_for_button_invisible=False)
        self._assert_message("有効なメールアドレスを入力してください。")  # todo message
        self._assert_current_url(self.signup_url)

        # 不正なemail（too short）
        user1_email = "a@b"
        nickname = self._generate_random_string()
        password1 = "pass0123"
        password2 = "pass0123"

        self._signup(user1_email,
                     nickname,
                     password1,
                     password2,
                     wait_for_button_invisible=False)
        self._assert_message(f"The email must be at least {CustomUser.kEMAIL_MIN_LENGTH} characters")
        self._assert_current_url(self.signup_url)

        # 不正なemail（too long）
        user1_email = f"a@{'b' * 64}.com"
        nickname = self._generate_random_string()
        password1 = "pass0123"
        password2 = "pass0123"

        self._signup(user1_email,
                     nickname,
                     password1,
                     password2,
                     wait_for_button_invisible=False)
        self._assert_message(f"The email must be {CustomUser.kEMAIL_MAX_LENGTH} characters or less")
        self._assert_current_url(self.signup_url)

        # すでに存在するnicknmae
        new_email = "new_user@example.com"
        user1_nickname = "user1"
        password1 = "pass0123"
        password2 = "pass0123"

        self._signup(new_email,
                     user1_nickname,
                     password1,
                     password2,
                     wait_for_button_invisible=False)
        self._assert_message("This nickname is already in use")
        self._assert_current_url(self.signup_url)

        # 不正なニックネーム（alnum以外）
        new_email = "new_user@example.com"
        invalid_nickname = "nick_name"
        password1 = "pass0123"
        password2 = "pass0123"

        self._signup(new_email,
                     invalid_nickname,
                     password1,
                     password2,
                     wait_for_button_invisible=False)
        self._assert_message("Invalid nickname format")
        self._assert_current_url(self.signup_url)

        # 不正なニックネーム（全角）
        new_email = "new_user@example.com"
        invalid_nickname = "ニックネーム"
        password1 = "pass0123"
        password2 = "pass0123"

        self._signup(new_email,
                     invalid_nickname,
                     password1,
                     password2,
                     wait_for_button_invisible=False)
        self._assert_message("The nickname can only contain ASCII characters")
        self._assert_current_url(self.signup_url)

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
