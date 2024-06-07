from . import *


class TwoFactorAuthTest(TestConfig):
    def setUp(self):
        super().setUp()

        self.nickname = self._generate_random_string(20)
        self.email = f"{self.nickname}@example.com"
        self.password = "pass0123"

        # friend request用のtest_user1, test_user2を作成
        self._create_new_user(email=self.email,
                              nickname=self.nickname,
                              password=self.password)

    def test_enable2fa(self):
        self._login(self.email, self.password)
        self._move_top_to_profile()

        # 2FA有効化
        self._assert_is_2fa_enabled(expected_2fa_enabled=False)
        set_up_key = self._setting_enable_2fa()
        self._assert_is_2fa_enabled(expected_2fa_enabled=True)

        # self._screenshot("enable2fa_1")

        # logout
        self._logout()

        # login with 2FA
        self._login(self.email, self.password)
        # verify2faに遷移
        self._assert_current_url(self.verify_2fa_url)

        # self._screenshot("enable2fa_2")

        self._verify_login_2fa(set_up_key)
        self._assert_current_url(self.top_url)

        # 2FA無効化
        self._move_top_to_profile()

        # self._screenshot("enable2fa_3")

        self._assert_is_2fa_enabled(expected_2fa_enabled=True)
        self._setting_disable_2fa()
        self._assert_is_2fa_enabled(expected_2fa_enabled=False)

        # self._screenshot("enable2fa_4")

        # logout
        self._logout()

        # login w/o 2FA
        self._login(self.email, self.password)
        # verify2faではなくtopに遷移
        self._assert_current_url(self.top_url)

    def _setting_disable_2fa(self):
        """
        user profile pageから2FAを無効にする
        アラートの表示項目も評価
        """
        disable2fa_button = self._button(By.CSS_SELECTOR, ".disable2faButton")
        # 無効化

        # confirmをキャンセル
        self._click_button(disable2fa_button, wait_for_button_invisible=False)
        self._dismiss_alert("Are you sure you want to Disable2FA ?")
        self._close_alert("2FA disable has been canceled")

        # 無効化
        self._click_button(disable2fa_button, wait_for_button_invisible=False)
        self._close_alert("Are you sure you want to Disable2FA ?")
        self._close_alert("2FA disable successful")

    def _verify_login_2fa(self, set_up_key: str):
        verify2fa_button = self._button(By.CSS_SELECTOR, ".verify2FaButton")

        otp_token = self._get_otp_token(set_up_key)
        self._send_to_elem(By.ID, "token", otp_token)

        self._click_button(verify2fa_button)
