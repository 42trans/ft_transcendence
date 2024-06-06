import time

from . import *

kURL_PREFIX = "https://nginx"


class UrlAccessTest(TestConfig):
    # def test_access_by_guest(self):
    #     for page_name, page_path in self.url_config.items():
    #         url = f"{kURL_PREFIX}{page_path}"
    #         print(f"{page_name} {page_path}")
    #
    #         # url with `:param`
    #         if self._is_url_base_with_param(page_name):
    #             continue
    #         if self._is_url_with_param(page_name):
    #             url = f"{kURL_PREFIX}{self.url_config[page_name]}user2/"
    #
    #         self._access_to(url)
    #         time.sleep(1)
    #
    #         self._screenshot(f"test_access_by_guest_{page_name}")
    #
    #         if self._login_required_page(page_name):
    #             self._is_login_page()
    #         else:
    #             self._assert_current_url(url)

    def test_access_by_user(self):
        self._login_user1_from_top_page()

        for page_name, page_path in self.url_config.items():
            url = f"{kURL_PREFIX}{page_path}"

            # url with `:param`
            if self._is_url_base_with_param(page_name):
                continue
            if self._is_url_with_param(page_name):
                url = f"{kURL_PREFIX}{self.url_config[page_name]}user2/"

            self._access_to(url)
            self._assert_current_url(url)

    def _login_required_page(self, page_name):
        login_required_page_names = {
            "kSpaTournamentUrl",
            # "kSpaGame3D",
            # "kSpaGameHistoryUrl",
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
        return page_name in login_required_page_names

    def _is_url_with_param(self, page_name):
        url_with_param_page_names = {
            "kSpaDmWithUrl",
            "kSpaDmWithUrl",
        }
        return page_name in url_with_param_page_names

    def _is_url_base_with_param(self, page_name):
        url_base_with_param_page_names = {
            "kSpaDmWithUrlBase",
            "kSpaDmWithUrlBase",
        }
        return page_name in url_base_with_param_page_names

    def _is_login_page(self):
        """
        login buttonが表示されている場合はlogin pageとみなす
        """
        login_button = self._element(By.ID, "login-btn")
        self.assertTrue(login_button.is_displayed())
