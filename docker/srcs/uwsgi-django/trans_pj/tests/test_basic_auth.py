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

    # def test_logout(self):
    #     self.test_login_success()
    #     self._logout()
    #     self._assert_current_url(self.top_url)
