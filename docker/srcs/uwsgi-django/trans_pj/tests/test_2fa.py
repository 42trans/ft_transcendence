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

    def _assert_is_2fa_enabled(self, expected_2fa_enabled: bool):
        twofa_status_element = self._element(By.ID, "2fa-status")
        actual_status_text = twofa_status_element.text

        # Disable2FA, Enable2FAリンク含む要素になっている
        expected_status_text = "2FA: ✅Enabled Disable2FA" if expected_2fa_enabled else "2FA: Disabled Enable2FA"
        self.assertEqual(actual_status_text, expected_status_text)

    def _setting_enable_2fa(self):
        """
        user profile pageから2FAを有効にする
        """
        # user profile page -> enable2fa page
        enable2fa_link = self._text_link("Enable2FA")
        self.assertTrue(enable2fa_link.text, "Enable2FA")
        self._click_link(enable2fa_link)
        self._assert_current_url(self.enable_2fa_url)

        # あらかじめbutton要素を取得しておく
        enable2ba_button = self._button(By.CSS_SELECTOR, ".verifyTokenButton")

        set_up_key_element = self._element(By.CSS_SELECTOR, ".pb-1")
        set_up_key = set_up_key_element.text

        # otpを送信（11 sec以上の余裕あり）
        otp_token = self._get_otp_token(set_up_key)
        self._send_to_elem(By.ID, "token", otp_token)

        # 有効化
        self._click_button(enable2ba_button, wait_for_button_invisible=False)
        self._close_alert("2FA has been enabled successfully")
        return set_up_key

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
        self.driver.refresh()

    def _get_otp_token(self, set_up_key: str):
        update_interval = 30
        current_timestamp = int(time.time())
        remaining_sec = update_interval - (current_timestamp % update_interval)

        # otpの更新まで10sec以上を保証（html要素取得のdefault timeout = 10sec）
        if remaining_sec <= 10:
            time.sleep(remaining_sec + 1)

        totp = TOTP(set_up_key)
        otp_token = totp.now()
        # print(f"otp_token: {otp_token}")
        return otp_token

    def _verify_login_2fa(self, set_up_key: str):
        verify2fa_button = self._button(By.CSS_SELECTOR, ".verify2FaButton")

        otp_token = self._get_otp_token(set_up_key)
        self._send_to_elem(By.ID, "token", otp_token)

        self._click_button(verify2fa_button)
