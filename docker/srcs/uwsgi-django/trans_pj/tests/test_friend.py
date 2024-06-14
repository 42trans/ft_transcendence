import time

from . import *


class FriendTest(TestConfig):
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

    def test_access_friend(self):
        self._login(email=self.test_user1_email, password=self.password)
        # self._screenshot("friend")
        self._move_top_to_friend()

    def test_accept_friend_request(self):
        """
        user1: user2へFriend Reuqestを送信
        user2: user1からのFriend ReuqestをAcceptし、Friendsへの追加を確認後、Delete
        """
        # test_user1 -> test_user2にFriend Requestを送信 #########################
        # test_user1でlogin
        self._login(email=self.test_user1_email, password=self.password)
        # self._screenshot("friend1")

        # test_user2のinfo pageへアクセスし、friend requestを送信
        self._access_to(f"{self.user_info_base_url}{self.test_user2_nickname}/")
        # self._screenshot("friend2")

        request_button = self._button(By.CSS_SELECTOR, ".sendFriendRequestButton")
        self._click_button(request_button, wait_for_button_invisible=True)

        # test_user2のinfoでcancelFriendRequestButtonの存在を確認
        self._assert_element_exists(By.CSS_SELECTOR, ".cancelFriendRequestButton")
        # self._screenshot("friend3")

        # test_user1のSent Friend Requestsに追加されていることを確認
        self._move_top_to_friend()

        # Sent Friend Requests
        # cancel buttonとtest_user2名がinfoへのリンクを評価
        sent_requests_div = self._element(By.XPATH, "//div[h3[contains(text(), 'Sent Friend Requests')]]")
        send_to_user2_item = sent_requests_div.find_element(By.XPATH, f".//li[contains(., '{self.test_user2_nickname}')]")
        cancel_button = send_to_user2_item.find_element(By.CSS_SELECTOR, ".cancelButton")
        info_link = send_to_user2_item.find_element(By.LINK_TEXT, f"{self.test_user2_nickname}")
        self.assertEqual(info_link.get_attribute("href"), f"{self.user_info_base_url}{self.test_user2_nickname}/")
        # self._screenshot("friend4")

        # test_user1をlogout
        self._logout()

        # test_user2でFriend Requestを承認 ######################################
        # test_user2でlogin
        self._login(email=self.test_user2_email, password=self.password)
        self._move_top_to_friend()
        # self._screenshot("friend5")

        # Received Friend Requests
        # Request from test_user1 Accept Reject を評価
        received_requests_div = self._element(By.XPATH, "//div[h3[contains(text(), 'Received Friend Requests')]]")
        request_from_user1_item = received_requests_div.find_element(By.XPATH, f".//li[contains(., '{self.test_user1_nickname}')]")
        accept_button = request_from_user1_item.find_element(By.CSS_SELECTOR, ".acceptButton")
        reject_button = request_from_user1_item.find_element(By.CSS_SELECTOR, ".rejectButton")

        # Acceptをクリック
        self._click_button(accept_button, wait_for_button_invisible=False)
        self._close_alert(f"Success: accept request")
        # self._screenshot("friend6")

        self.driver.refresh()
        time.sleep(0.5)

        # Friendsにtest_user1が追加されていることを確認
        friends_div = self._element(By.ID, "friends-container")
        friend_item = friends_div.find_element(By.XPATH, f".//li[contains(., '{self.test_user1_nickname}')]")
        delete_button = friend_item.find_element(By.CSS_SELECTOR, ".deleteButton")
        # friend nameのlink: info page
        user_name_link_url = self._text_link_url(self.test_user1_nickname)
        self.assertEqual(user_name_link_url, f"{self.user_info_base_url}{self.test_user1_nickname}/")

        # delete buttonのチェック
        # ConfirmでCancelしDelete中断
        self._click_button(delete_button, wait_for_button_invisible=False)
        self._dismiss_alert("Are you sure you want to delete this friend ?")
        self._close_alert("Friend deletion has been canceled")
        self.assertTrue(friend_item.is_displayed())  # friendが削除されていない

        # ConfirmでCanselせずにDelete実行
        self._click_button(delete_button, wait_for_button_invisible=False)
        self._close_alert("Are you sure you want to delete this friend ?")
        self._close_alert("Success: delete friend")

        self.driver.refresh()
        time.sleep(0.5)

        updated_friends_div = self._element(By.ID, "friends-container")
        friend_items = updated_friends_div.find_elements(By.XPATH, f".//li[contains(., '{self.test_user1_nickname}')]")
        self.assertEqual(len(friend_items), 0, msg="Friend item should be removed after deletion")
        # self._screenshot("friend7")

    def test_cancel_sent_request(self):
        """
        user1: user2へFriend Reuqestを送信後、Cancel
        """
        self._login(email=self.test_user1_email, password=self.password)

        # test_user2 info page #################################################
        self._access_to(f"{self.user_info_base_url}{self.test_user2_nickname}/")

        # requestを送信
        request_button = self._button(By.CSS_SELECTOR, ".sendFriendRequestButton")
        self._click_button(request_button, wait_for_button_invisible=True)

        self.driver.refresh()
        time.sleep(0.5)

        # Cancel
        cancel_button = self._element(By.CSS_SELECTOR, ".cancelFriendRequestButton")
        self._click_button(cancel_button, wait_for_button_invisible=False)
        self._close_alert("Friend request cancelled")

        self.driver.refresh()
        time.sleep(0.5)

        # requestを再送信
        request_button = self._button(By.CSS_SELECTOR, ".sendFriendRequestButton")
        self._click_button(request_button, wait_for_button_invisible=True)

        # test_user1 friend page ###############################################
        self._move_top_to_friend()

        # Sent Friend Requests
        # Cancel
        sent_requests_div = self._element(By.XPATH, "//div[h3[contains(text(), 'Sent Friend Requests')]]")
        send_to_user2_item = sent_requests_div.find_element(By.XPATH, f".//li[contains(., '{self.test_user2_nickname}')]")
        cancel_button = send_to_user2_item.find_element(By.CSS_SELECTOR, ".cancelButton")
        self._click_button(cancel_button, wait_for_button_invisible=False)
        self._close_alert("Friend request cancelled")

    def test_reject_friend_request(self):
        """
        user1: user2へFriend Reuqestを送信
        user2: user1からのFriend ReuqestをReject
        """
        # test_user1 -> test_user2にFriend Requestを送信 #########################
        # test_user1でlogin
        self._login(email=self.test_user1_email, password=self.password)
        # self._screenshot("friend1")

        # test_user2のinfo pageへアクセスし、friend requestを送信
        self._access_to(f"{self.user_info_base_url}{self.test_user2_nickname}/")
        # self._screenshot("friend2")

        request_button = self._button(By.CSS_SELECTOR, ".sendFriendRequestButton")
        self._click_button(request_button, wait_for_button_invisible=True)

        # test_user1のSent Friend Requestsに追加されていることを確認
        self._move_top_to_friend()

        # test_user1をlogout
        self._logout()

        # test_user2でFriend Requestを承認 ######################################
        # test_user2でlogin
        self._login(email=self.test_user2_email, password=self.password)
        self._move_top_to_friend()
        # self._screenshot("friend3")

        # Received Friend Requests
        # Request from test_user1 Accept Reject を評価
        received_requests_div = self._element(By.XPATH, "//div[h3[contains(text(), 'Received Friend Requests')]]")
        request_from_user1_item = received_requests_div.find_element(By.XPATH, f".//li[contains(., '{self.test_user1_nickname}')]")
        accept_button = request_from_user1_item.find_element(By.CSS_SELECTOR, ".acceptButton")
        reject_button = request_from_user1_item.find_element(By.CSS_SELECTOR, ".rejectButton")
        # self._screenshot("friend4")

        # Rejectをクリック
        # ConfirmでCancel
        self._click_button(reject_button, wait_for_button_invisible=False)
        self._dismiss_alert("Are you sure you want to reject this request ?")
        self._close_alert("Request rejection has been canceled")

        # ConfirmでCancelせずにReject実行
        self._click_button(reject_button, wait_for_button_invisible=False)
        self._close_alert("Are you sure you want to reject this request ?")
        self._close_alert("Success: reject request")

        self.driver.refresh()
        time.sleep(0.5)

        # Received Friend Requestsにtest_user1からのリクエストが存在しないことを確認
        updated_received_requests_div = self._element(By.XPATH, "//div[h3[contains(text(), 'Received Friend Requests')]]")
        received_request_items = updated_received_requests_div.find_elements(By.XPATH, f".//li[contains(., '{self.test_user1_nickname}')]")
        self.assertEqual(len(received_request_items), 0, "Received request from test_user1 should be removed after rejection")

        # Friendsにtest_user1が存在しないことを確認
        friends_div = self._element(By.ID, "friends-container")
        friend_items = friends_div.find_elements(By.XPATH, f".//li[contains(., '{self.test_user1_nickname}')]")
        self.assertEqual(len(friend_items), 0, "test_user1 should not be in the friends list after request rejection")
        # self._screenshot("friend5")
