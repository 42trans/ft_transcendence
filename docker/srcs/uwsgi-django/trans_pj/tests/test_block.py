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

    def test_block_user(self):
        """
        user1がuser2をblock -> DM非表示
        """
        # test_user1でlogin
        self._login(email=self.test_user1_email, password=self.password)

        self._screenshot("block 1")

        # DMへ遷移し、dm-log要素が存在することを確認
        self._move_top_to_dm()
        self._send_dm_with_form(self.test_user2_nickname)
        self.assertTrue(self._is_unblocking_dm())

        self._screenshot("block 2")

        # test_user2のinfo pageへアクセスし、block
        self._block_user(self.test_user2_nickname)
        self._screenshot("block 3")

        # DMへ遷移し、dm-log要素が非表示であることを確認
        self._access_to(f"{self.dm_with_base_url}{self.test_user2_nickname}/")
        self.assertFalse(self._is_unblocking_dm())

        self._screenshot("block 4")

        # test_user2のinfo pageへアクセスし、unblock
        self._unblock_user(self.test_user2_nickname)

        # DMへ遷移し、dm-log要素が非表示であることを確認
        self._access_to(f"{self.dm_with_base_url}{self.test_user2_nickname}/")
        self.assertTrue(self._is_unblocking_dm())

        self._screenshot("block 5")

    def _is_unblocking_dm(self):
        """"
        blockしていない場合、dm-log, message-inputが表示されている
        """
        try:
            self._element(By.ID, "dm-log")
            self._element(By.ID, "message-input")
            return True
        except Exception:
            return False

    def _block_user(self, target_nickname):
        self._access_to(f"{self.user_info_base_url}{target_nickname}/")

        block_button = self._button(By.CSS_SELECTOR, ".blockUserButton")
        self._click_button(block_button, wait_for_button_invisible=False)
        self._close_alert(f"User {target_nickname} successfully blocked")

    def _unblock_user(self, target_nickname):
        self._access_to(f"{self.user_info_base_url}{target_nickname}/")

        unblock_button = self._button(By.CSS_SELECTOR, ".unBlockUserButton")
        self._click_button(unblock_button, wait_for_button_invisible=False)
        self._close_alert(f"User {target_nickname} successfully unblocked")
