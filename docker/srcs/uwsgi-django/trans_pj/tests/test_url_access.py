from . import *


class UrlAccessTest(TestConfig):
    def setUp(self):
        super().setUp()

        self.user1_nickname = self._generate_random_string(20)
        self.user1_email = f"{self.user1_nickname}@example.com"

        self.user2_nickname = self._generate_random_string(20)
        self.user2_email = f"{self.user2_nickname}@example.com"

        # 2FA Enable user
        self.user3_nickname = self._generate_random_string(30)
        self.user3_email = f"{self.user3_nickname}@example.com"

        self.password = "pass0123"

        self._create_new_user(email=self.user1_email,
                              nickname=self.user1_nickname,
                              password=self.password)

        self._create_new_user(email=self.user2_email,
                              nickname=self.user2_nickname,
                              password=self.password)

        self.set_up_key = self._create_new_user(
                              email=self.user3_email,
                              nickname=self.user3_nickname,
                              password=self.password,
                              is_enable_2fa=True)

    ############################################################################

    def test_access_by_guest(self):
        """
        ゲストでのアクセス
        is_page_login_required()に該当するページはlogin pageに遷移することが期待される(urlはkeepする)
        login成功後はリダイレクト元のurlに遷移する
        """
        print(f"[GUEST]")
        for page_name, page_path in self.url_config.items():
            print(f" [Testing] page_name    : {page_name}")
            print(f"           page_path    : {page_path}")

            if self._except_test_page(page_name):
                print(f"           skip")
                continue

            url = self._get_url(page_name, page_path)
            self._access_to(url, wait_to_be_url=False)
            time.sleep(0.5)  # 明示的に待機
            # self._screenshot(f"guest_{page_name}")

            if self._is_url_with_param(page_name):
                expected_url = f"{kURL_PREFIX}{page_path}{self.user2_nickname}/"
            else:
                expected_url = f"{kURL_PREFIX}{page_path}"

            print(f"           expected_url : {expected_url}")
            print(f"           current_url  : {self.driver.current_url}")
            self._assert_current_url(expected_url)

            # ページ表示内容を評価
            if self._is_page_login_required(page_name):
                self._is_login_page()  # login pageであることを確認
                print(f"           expected login: ok")
            elif page_name == "kSpaAuthLoginUrl":
                pass
            else:
                self._is_not_login_page()  # login pageでないことを確認

    def test_access_by_2fa_disabled_user_(self):
        """
        2FA無効userでのアクセス
        is_page_redirect_to_top()に該当するページはtopに遷移することが期待される
        """
        print(f"[USER: 2FA Disabled]")
        self._login(email=self.user1_email, password=self.password)

        for page_name, page_path in self.url_config.items():
            print(f" [Testing] page_name    : {page_name}")
            print(f"           page_path    : {page_path}")

            if self._except_test_page(page_name):
                print(f"           skip")
                continue

            url = self._get_url(page_name, page_path)
            self._access_to(url, wait_to_be_url=False)
            time.sleep(0.5)  # 明示的に待機
            # self._screenshot(f"user1_{page_name}")

            if self._is_page_redirect_to_top(page_name, is_enable_2fa=False):
                expected_url = self.top_url
            elif self._is_url_with_param(page_name):
                expected_url = f"{kURL_PREFIX}{page_path}{self.user2_nickname}/"
            else:
                expected_url = f"{kURL_PREFIX}{page_path}"

            print(f"           expected_url : {expected_url}")
            print(f"           current_url  : {self.driver.current_url}")
            # self._assert_current_url(expected_url)

            # ページ表示内容を評価
            if expected_url == self.top_url:
                self._is_top_page()
                print(f"           expected top : ok")
            else:
                self._is_not_top_page(page_name)  # top pageでないことを確認

    def test_access_by_2fa_enabled_user(self):
        """
        2FA有効userでのアクセス
        is_page_redirect_to_top()に該当するページはtopに遷移することが期待される
        """
        print(f"[USER: 2FA Enabled]")
        self._login(email=self.user3_email, password=self.password)
        self._verify_login_2fa(self.set_up_key)

        for page_name, page_path in self.url_config.items():
            print(f" [Testing] page_name    : {page_name}")
            print(f"           page_path    : {page_path}")

            if self._except_test_page(page_name):
                print(f"           skip")
                continue

            url = self._get_url(page_name, page_path)
            self._access_to(url, wait_to_be_url=False)
            time.sleep(0.5)  # 明示的に待機
            # self._screenshot(f"user3_{page_name}")

            if self._is_page_redirect_to_top(page_name, is_enable_2fa=True):
                expected_url = self.top_url
            elif self._is_url_with_param(page_name):
                expected_url = f"{kURL_PREFIX}{page_path}{self.user2_nickname}/"
            else:
                expected_url = f"{kURL_PREFIX}{page_path}"

            print(f"           expected_url : {expected_url}")
            print(f"           current_url  : {self.driver.current_url}")
            # self._assert_current_url(expected_url)

            # ページ表示内容を評価
            if expected_url == self.top_url:
                self._is_top_page()
                print(f"           expected top : ok")
            else:
                self._is_not_top_page(page_name)  # top pageでないことを確認

    def _except_test_page(self, page_name):
        """
        本テストから除外するurl
        """
        except_test_pages = {
            "kSpaGameMatchBase",
            "kSpaGameMatchUrl",
            "kSpaUserInfoUrl",
            "kSpaDmWithUrl",
        }
        return page_name in except_test_pages

    def _is_page_login_required(self, page_name):
        login_required_pages = {
            "kSpaTournamentUrl",
            # "kSpaGame3D",
            "kSpaGameHistoryUrl",
            "kSpaUserProfileUrl",
            "kSpaUserInfoUrlBase",  # :nicknameを置き換えるためにUrlBaseでテスト
            "kSpaUserFriendUrl",
            "kSpaEditProfileUrl",
            "kSpaChangeAvatarUrl",
            "kSpaDmUrl",
            "kSpaDmWithUrlBase",  # :nicknameを置き換えるためにUrlBaseでテスト
            "kSpaAuthEnable2FaUrl",
            "kSpaAuthVerify2FaUrl",
        }
        return page_name in login_required_pages

    def _is_page_redirect_to_top(self, page_name, is_enable_2fa):
        """
        2FA有効なuserはEnable2FAにアクセスする必要はないため、topに遷移する
        """
        if is_enable_2fa:
            login_user_redirect_to_top_pages = {
                "kSpaAuthEnable2FaUrl",
                "kSpaAuthVerify2FaUrl",
                "kSpaAuthSignupUrl",
                "kSpaAuthLoginUrl",
            }
        else:
            login_user_redirect_to_top_pages = {
                "kSpaAuthVerify2FaUrl",
                "kSpaAuthSignupUrl",
                "kSpaAuthLoginUrl",
            }
        return page_name in login_user_redirect_to_top_pages

    def _is_url_with_param(self, page_name):
        """
        `/url/:param` を検証するケース
        UrlBaseにparamを結合する
        """
        url_with_param_pages = {
            "kSpaUserInfoUrlBase",
            "kSpaDmWithUrlBase",
        }
        return page_name in url_with_param_pages

    def _is_login_page(self, retries=5):
        """
        'Please log in'が表示されている場合はlogin pageとみなす
        """
        try:
            self.driver.refresh()
            h1_element = self._element(
                by=By.CSS_SELECTOR,
                value="h1.slideup-text",
                timeout=1,
                retries=retries
            )
            self.assertIn("Please log in", h1_element.text)
        except Exception:
            raise AssertionError("Expected login page, but not found")

    def _is_not_login_page(self):
        try:
            self._is_login_page(retries=1)
        except AssertionError:
            pass
        else:
            self.fail("Expected: NOT login page")

    def _is_top_page(self, retries=5):
        """
        'Unrivaled hth Pong Experience'が表示されている場合は/app/とみなす
        """
        try:
            self.driver.refresh()
            h2_element = self._element(
                by=By.CSS_SELECTOR,
                value="h2.slideup-text.text-shadow-primary",
                timeout=1,
                retries=retries
            )
            self.assertIn("Unrivaled hth Pong Experience", h2_element.text)
        except Exception:
            raise AssertionError("Expected top page, but not found")

    def _is_not_top_page(self, page_name):
        try:
            self._is_top_page(retries=1)
        except AssertionError:
            pass
        else:
            self.fail(f"Expected: NOT top page: {page_name}")

    def _get_url(self, page_name, page_path):
        if self._is_url_with_param(page_name):
            url = f"{kURL_PREFIX}{page_path}{self.user2_nickname}/"
        else:
            url = f"{kURL_PREFIX}{page_path}"
        return url
