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
