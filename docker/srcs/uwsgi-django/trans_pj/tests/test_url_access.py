from . import *


PongTopPage      = "kSpaPongTopUrl"
HomePage         = "kSpaHomeUrl"

TournamentPage   = "kSpaTournamentUrl"
Game2D           = "kSpaGame2D"
# Game3D           = "kSpaGame3D"
GameMatchBase    = "kSpaGameMatchBase"
GameMatchPage    = "kSpaGameMatchUrl"

GameHistoryPage  = "kSpaGameHistoryUrl"
UserProfilePage  = "kSpaUserProfileUrl"
UserInfoPage     = "kSpaUserInfoUrl"
UserInfoUrlBase  = "kSpaUserInfoUrlBase"
UserFriendPage   = "kSpaUserFriendUrl"
EditProfilePage  = "kSpaEditProfileUrl"
ChangeAvatarPage = "kSpaChangeAvatarUrl"

DmPage           = "kSpaDmUrl"
DmWithPage       = "kSpaDmWithUrl"
DmWithUrlBase    = "kSpaDmWithUrlBase"

AuthEnable2FaPage = "kSpaAuthEnable2FaUrl"
AuthVerify2FaPage = "kSpaAuthVerify2FaUrl"
AuthSignupPage    = "kSpaAuthSignupUrl"
AuthLoginPage     = "kSpaAuthLoginUrl"


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

        self.user1_id, _ = self._create_new_user(
            email=self.user1_email,
            nickname=self.user1_nickname,
            password=self.password
        )

        self.user2_id, _ = self._create_new_user(
            email=self.user2_email,
            nickname=self.user2_nickname,
            password=self.password
        )

        self.user3_id, self.set_up_key = self._create_new_user(
            email=self.user3_email,
            nickname=self.user3_nickname,
            password=self.password,
            is_enable_2fa=True
        )

    ############################################################################

    def test_access_by_guest_to_2fa_off_user(self):
        """
        ゲストでのアクセス -> 2FA off userでlogin
        is_page_login_required()に該当するページはlogin pageに遷移することが期待される(urlはkeepする)
        login成功後はリダイレクト元のurlに遷移する
        """
        print(f"[GUEST -> Login(2FA OFF)]")
        for page_name, page_path in self.url_config.items():
            print(f" [Testing] page_name    : {page_name}")
            print(f"           page_path    : {page_path}")

            if self._except_test_page(page_name):
                print(f"           skip")
                continue

            url = self._get_url(page_name, page_path)
            self._access_to(url, wait_to_be_url=False)
            time.sleep(0.5)  # 明示的に待機
            # self._screenshot(f"guest_{page_name} 1")

            print(f"           access_url   : {url}")
            print(f"           current_url  : {self.driver.current_url}")
            # self._screenshot(f"guest_{page_name} 2")

            # ページ表示内容を評価
            if self._is_page_login_required(page_name) or page_name == AuthLoginPage:
                self._assert_current_url(self.login_url)
                self._is_expected_page(AuthLoginPage)  # login pageであることを確認

                print(f"           expected login: ok")
                # self._screenshot(f"guest_{page_name} 3")

                # login後にTOPへ遷移していることを確認
                self._login_for_redirected_page(email=self.user1_email, password=self.password)  # login
                print(f"           login         : success")
                # self._screenshot(f"guest_{page_name} 4")

                if page_name != AuthVerify2FaPage:  # verify2faはskip
                    self._assert_current_url(self.top_url)
                    self._is_expected_page(PongTopPage)  # topページに遷移していることを確認

                self._logout()  # 次のテストのためにlogout
            else:
                self._assert_current_url(url)
                self._is_not_login_page()  # login pageでないことを確認

    # todo: Actionsで2FA loginが不安定のため割愛
    # def test_access_by_guest_to_2fa_on_user(self):

    # def test_access_by_2fa_disabled_user(self):
    #     """
    #     2FA無効userでのアクセス
    #     is_page_redirect_to_top()に該当するページはtopに遷移することが期待される
    #     """
    #     print(f"[USER: 2FA Disabled]")
    #     self._login(email=self.user1_email, password=self.password)
    #
    #     for page_name, page_path in self.url_config.items():
    #         print(f" [Testing] page_name    : {page_name}")
    #         print(f"           page_path    : {page_path}")
    #
    #         if self._except_test_page(page_name):
    #             print(f"           skip")
    #             continue
    #
    #         url = self._get_url(page_name, page_path)
    #         self._access_to(url, wait_to_be_url=False)
    #         time.sleep(0.5)  # 明示的に待機
    #         # self._screenshot(f"user1_{page_name}")
    #
    #         print(f"           access_url   : {url}")
    #         print(f"           current_url  : {self.driver.current_url}")
    #         # self._assert_current_url(url)
    #
    #         # ページ表示内容を評価
    #         if self._is_page_redirect_to_top(page_name, is_enable_2fa=False) or url == self.top_url:
    #             self._is_expected_page(PongTopPage)
    #             print(f"           expected top : ok")
    #         else:
    #             self._is_not_top_page(page_name)  # top pageでないことを確認
    #
    # def test_access_by_2fa_enabled_user(self):
    #     """
    #     2FA有効userでのアクセス
    #     is_page_redirect_to_top()に該当するページはtopに遷移することが期待される
    #     """
    #     print(f"[USER: 2FA Enabled]")
    #     self._login(email=self.user3_email, password=self.password)
    #     self._verify_login_2fa(self.set_up_key)
    #
    #     for page_name, page_path in self.url_config.items():
    #         print(f" [Testing] page_name    : {page_name}")
    #         print(f"           page_path    : {page_path}")
    #
    #         if self._except_test_page(page_name):
    #             print(f"           skip")
    #             continue
    #
    #         url = self._get_url(page_name, page_path)
    #         self._access_to(url, wait_to_be_url=False)
    #         time.sleep(0.5)  # 明示的に待機
    #         # self._screenshot(f"user3_{page_name}")
    #
    #         print(f"           access_url   : {url}")
    #         print(f"           current_url  : {self.driver.current_url}")
    #         # self._assert_current_url(url)
    #
    #         # ページ表示内容を評価
    #         if self._is_page_redirect_to_top(page_name, is_enable_2fa=True) or url == self.top_url:
    #             self._is_expected_page(PongTopPage)
    #             print(f"           expected top : ok")
    #         else:
    #             self._is_not_top_page(page_name)  # top pageでないことを確認

    def _except_test_page(self, page_name):
        """
        本テストから除外するurl
        """
        except_test_pages = {
            GameMatchBase,
            GameMatchPage,
            UserInfoPage,
            DmWithPage,
            UserInfoUrlBase,  # login->app遷移, except追加
            DmWithUrlBase,  # login->app遷移, except追加
        }
        return page_name in except_test_pages

    def _is_page_login_required(self, page_name):
        login_required_pages = {
            TournamentPage,
            # Game3D,
            GameHistoryPage,
            UserProfilePage,
            UserInfoUrlBase,  # :nicknameを置き換えるためにUrlBaseでテスト  login->app遷移
            UserFriendPage,
            EditProfilePage,
            ChangeAvatarPage,
            DmPage,
            DmWithUrlBase,  # :nicknameを置き換えるためにUrlBaseでテスト
            AuthEnable2FaPage,
            AuthVerify2FaPage,
        }
        return page_name in login_required_pages

    def _is_page_redirect_to_top(self, page_name, is_enable_2fa):
        """
        2FA有効なuserはEnable2FAにアクセスする必要はないため、topに遷移する
        """
        if is_enable_2fa:
            login_user_redirect_to_top_pages = {
                AuthEnable2FaPage,
                AuthVerify2FaPage,
                AuthSignupPage,
                AuthLoginPage,
            }
        else:
            login_user_redirect_to_top_pages = {
                AuthVerify2FaPage,
                AuthSignupPage,
                AuthLoginPage,
            }
        return page_name in login_user_redirect_to_top_pages

    def _is_url_with_param(self, page_name):
        """
        `/url/:param` を検証するケース
        UrlBaseにparamを結合する
        """
        url_with_param_pages = {
            UserInfoUrlBase,
            DmWithUrlBase,  # /url/<user_id>/ に変更, id取得必要のためテストNG
        }
        return page_name in url_with_param_pages

    def _is_not_login_page(self):
        try:
            self._is_expected_page(
                page_name=AuthLoginPage,
                timeout=1,
                retries=1,
                verbose=False  # timeout発生するためException log非表示
            )
        except AssertionError:
            pass
        else:
            self.fail("Expected: NOT login page")

    def _is_not_top_page(self, page_name):
        try:
            self._is_expected_page(
                page_name=PongTopPage,
                timeout=1,
                retries=1,
                verbose=False  # timeout発生するためException log非表示
            )
        except AssertionError:
            pass
        else:
            self.fail(f"Expected: NOT top page: {page_name}")

    def _is_expected_page(self, page_name, timeout=10, retries=5, verbose=True):
        # self.driver.refresh()  # tournamentのalertが再popするため使用しない
        try:
            if page_name == PongTopPage:
                """
                'Unrivaled hth Pong Experience'が表示されている場合はtop pageとみなす
                """
                h2_element = self._element(
                    by=By.CSS_SELECTOR,
                    value="h2.slideup-text.text-shadow-primary",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIn("Unrivaled hth Pong Experience", h2_element.text)

            elif page_name == TournamentPage:
                return

                """
                'tournament-container'が表示されている場合はtournament pageとみなす
                """
                tournament_container = self._element(
                    by=By.ID,
                    value="tournament-container",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIsNotNone(tournament_container)

            elif page_name == GameMatchBase:
                """
                ''が表示されている場合はpageとみなす
                """
                return

            elif page_name == GameHistoryPage:
                """
                ''s Game History'が表示されている場合はgame history pageとみなす
                """
                h1_element = self._element(
                    by=By.CSS_SELECTOR,
                    value="h1",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIn(f"s Game History", h1_element.text)

            elif page_name == UserProfilePage:
                """
                'user-info-container'が表示されている場合はuser profile pageとみなす
                """
                user_info_container = self._element(
                    by=By.CSS_SELECTOR,
                    value=".user-info-container",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIsNotNone(user_info_container)

            elif page_name == UserInfoUrlBase:
                """
                'User Info (public)'が表示されている場合はuser info pageとみなす
                """
                h1_element = self._element(
                    by=By.CSS_SELECTOR,
                    value="h1",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIn("User Info (public)", h1_element.text)

            elif page_name == UserFriendPage:
                """
                'friends-info-container'が表示されている場合はfriend pageとみなす
                """
                friends_info_container = self._element(
                    by=By.CSS_SELECTOR,
                    value=".friends-info-container",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIsNotNone(friends_info_container)

            elif page_name == EditProfilePage:
                """
                'Edit user profile'が表示されている場合はedit profile pageとみなす
                """
                h2_element = self._element(
                    by=By.CSS_SELECTOR,
                    value="h2",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIn("Edit user profile", h2_element.text)

            elif page_name == ChangeAvatarPage:
                """
                'UploadNewAvatar button'が表示されている場合はchange-avatar pageとみなす
                """
                upload_button = self._element(
                    by=By.ID,
                    value="uploadAvatarButton",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIsNotNone(upload_button)

            elif page_name == DmPage:
                """
                'Start DM'が表示されている場合はdm pageとみなす
                """
                h2_element = self._element(
                    by=By.CSS_SELECTOR,
                    value="h2",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIn("Start DM", h2_element.text)

            elif page_name == DmWithUrlBase:
                """
                'DM with'が表示されている場合はdm with pageとみなす
                """
                h2_element = self._element(
                    by=By.CSS_SELECTOR,
                    value="h2",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIn("DM with", h2_element.text)

            elif page_name == AuthEnable2FaPage:
                """
                'Enable Two-Factor Authentication (2FA)'が表示されている場合はenable2fa pageとみなす
                """
                h2_element = self._element(
                    by=By.CSS_SELECTOR,
                    value="h2.pb-3",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIn("Enable Two-Factor Authentication (2FA)", h2_element.text)

            elif page_name == AuthVerify2FaPage:
                """
                'Verify Two-Factor Authentication (2FA)'が表示されている場合はverify2fa pageとみなす
                """
                h2_element = self._element(
                    by=By.CSS_SELECTOR,
                    value="h2.pb-3",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIn("Verify Two-Factor Authentication (2FA)", h2_element.text)

            elif page_name == AuthSignupPage:
                """
                'Please sign up'が表示されている場合はsign up pageとみなす
                """
                h1_element = self._element(
                    by=By.CSS_SELECTOR,
                    value="h1.slideup-text",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIn("Please sign up", h1_element.text)

            elif page_name == AuthLoginPage:
                """
                'Please log in'が表示されている場合はlogin pageとみなす
                """
                h1_element = self._element(
                    by=By.CSS_SELECTOR,
                    value="h1.slideup-text",
                    timeout=timeout,
                    retries=retries,
                    verbose=verbose
                )
                self.assertIn("Please log in", h1_element.text)
            else:
                self.fail(f"pagename:{page_name} not expecteds")

        except Exception:
            raise AssertionError(f"pagename:{page_name}, but not found")

    def _get_url(self, page_name, page_path):
        if self._is_url_with_param(page_name):
            url = f"{kURL_PREFIX}{page_path}{self.user2_id}/"
        else:
            url = f"{kURL_PREFIX}{page_path}"
        return url

    def _login_for_redirected_page(self, email, password):
        self._send_to_elem(By.ID, "email", email)
        self._send_to_elem(By.ID, "password", password)

        login_button = self._element(By.ID, "login-btn")
        self._click_button(login_button, wait_for_button_invisible=True)
