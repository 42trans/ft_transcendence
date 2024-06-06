from . import *


class DMTest(TestConfig):
    def setUp(self):
        super().setUp()

        self.test_user1_nickname = self._generate_random_string(20)
        self.test_user1_email = f"{self.test_user1_nickname}@example.com"

        self.test_user2_nickname = self._generate_random_string(20)
        self.test_user2_email = f"{self.test_user2_nickname}@example.com"

        self.password = "pass0123"

        # friend request用のtest_user1, test_user2を作成
        self._create_new_user(email=self.test_user1_email,
                              nickname=self.test_user1_nickname,
                              password=self.password)

        self._create_new_user(email=self.test_user2_email,
                              nickname=self.test_user2_nickname,
                              password=self.password)

    ############################################################################

    def test_access_dm(self):
        self._login_user1_from_top_page()
        self._move_top_to_dm()

        # フォームの要素の検証 ####################################################
        self._assert_element(By.ID, "nickname-input", is_displayed=True)

    def test_send_dm(self):
        """
        user1 -> user2へのメッセージ送信
        """
        # test_user1 -> test_user2にDMを送信 #####################################
        # test_user1でlogin
        self._login(email=self.test_user1_email, password=self.password)
        # self._screenshot("dm1")

        # DMへ遷移し、dm-log要素が存在することを確認
        self._move_top_to_dm()
        self._send_dm_with_form(self.test_user2_nickname)

        message = f"test message from {self.test_user1_nickname} to {self.test_user2_nickname}"
        self._send_message(message)
        sent_message = self._element(By.CSS_SELECTOR, "#dm-log li.dm-from .message-content span:first-child")
        self.assertEqual(sent_message.text, message)
        # self._screenshot("dm2")

        self._logout()

        # test_user2が受信したDM #################################################
        self._login(email=self.test_user2_email, password=self.password)
        self._access_to(f"{self.dm_with_base_url}{self.test_user1_nickname}/")
        received_message = self._element(By.CSS_SELECTOR, "#dm-log li.dm-to .message-content span:first-child")
        self.assertEqual(received_message.text, message)
        # self._screenshot("dm3")

    def test_input_nickname(self):
        """
        StartDMでnicknameを入力した時の挙動を評価
        """
        self._login(email=self.test_user1_email, password=self.password)
        self._move_top_to_dm()

        empty_nickname = ""
        self._send_nickname(empty_nickname, wait_for_button_invisible=False)
        self._assert_message("Nickname cannot be empty")
        self._assert_current_url(self.dm_url)
        # self._screenshot("dm1")

        invalid_nickname = "invalid"
        self._send_nickname(invalid_nickname, wait_for_button_invisible=False)
        self._assert_message("The specified user does not exist")
        self._assert_current_url(self.dm_url)
        # self._screenshot("dm2")

        own_nickname = self.test_user1_nickname
        self._send_nickname(own_nickname, wait_for_button_invisible=False)
        self._assert_message("You cannot send a message to yourself")
        self._assert_current_url(self.dm_url)
        # self._screenshot("dm3")

        xss_input = '<script>alert("hello")</script>'
        self._send_nickname(xss_input, wait_for_button_invisible=False)
        self._assert_message("The specified user does not exist")
        self._assert_current_url(self.dm_url)
        # self._screenshot("dm4")

        valid_nickname = "user2"
        self._send_nickname(valid_nickname, wait_for_button_invisible=True)
        self._assert_current_url(f"{self.dm_with_base_url}{valid_nickname}/")
        # self._screenshot("dm5")

    def _send_message(self, message):
        self._send_to_elem(By.ID, "message-input", message)
        send_button = self._element(By.ID, "message-submit")
        self._click_button(send_button, wait_for_button_invisible=False)

    def _send_nickname(self, nickname, wait_for_button_invisible: bool):
        self._send_to_elem(By.ID, "nickname-input", nickname)
        send_button = self._element(By.ID, "nickname-submit")
        self._click_button(send_button, wait_for_button_invisible)
