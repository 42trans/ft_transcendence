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

        self._create_new_user(email=self.user3_email,
                              nickname=self.user3_nickname,
                              password=self.password,
                              is_enable_2fa=True)

    ############################################################################

    def test_access_by_guest(self):
        print(f"[GUEST]")
        for page_name, page_path in self.url_config.items():
            print(f" [Testing] page_name    : {page_name}")
            print(f"           page_path    : {page_path}")

            if self._except_test_page(page_name):
                print(f"           skip")
                continue

            url = self._get_url(page_name, page_path)
            self._access_to(url)
            time.sleep(0.5)  # 明示的に待機
            # self._screenshot(f"guest_{page_name}")

            if self._is_page_login_required(page_name):
                expected_url = self.login_url
            elif self._is_url_with_param(page_name):
                expected_url = f"{kURL_PREFIX}{page_path}{self.user2_nickname}/"
            else:
                expected_url = f"{kURL_PREFIX}{page_path}"

            print(f"           expected_url : {expected_url}")
            print(f"           current_url  : {self.driver.current_url}")
            self._assert_current_url(expected_url)

    def test_access_by_2fa_disabled_user_(self):
        """
        2FA無効userでのアクセス
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
            self._access_to(url)
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
            self._assert_current_url(expected_url)

    def test_access_by_2fa_enabled_user(self):
        """
        2FA有効userでのアクセス
        """
        print(f"[USER: 2FA Enabled]")
        self._login(email=self.user1_email, password=self.password)

        for page_name, page_path in self.url_config.items():
            print(f" [Testing] page_name    : {page_name}")
            print(f"           page_path    : {page_path}")

            if self._except_test_page(page_name, page_name):
                print(f"           skip")
                continue

            url = self._get_url(page_name, page_path)
            self._access_to(url)
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
            self._assert_current_url(expected_url)

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
            "kSpaUserInfoUrl",
            "kSpaUserFriendUrl",
            "kSpaEditProfileUrl",
            "kSpaChangeAvatarUrl",
            "kSpaDmUrl",
            "kSpaDmWithUrl",
            "kSpaAuthEnable2FaUrl",
            "kSpaAuthVerify2FaUrl",
            "kSpaAuthSignupUrl",
            "kSpaAuthLoginUrl",
        }
        return page_name in login_required_pages

    def _is_page_redirect_to_top(self, page_name, is_enable_2fa):
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

    def _is_login_page(self):
        """
        login buttonが表示されている場合はlogin pageとみなす
        """
        login_button = self._element(By.ID, "login-btn")
        self.assertTrue(login_button.is_displayed())

    def _get_url(self, page_name, page_path):
        if self._is_url_with_param(page_name):
            url = f"{kURL_PREFIX}{page_path}{self.user2_nickname}/"
        else:
            url = f"{kURL_PREFIX}{page_path}"
        return url
