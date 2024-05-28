import json
import datetime

from selenium import webdriver
from selenium.common.exceptions import TimeoutException, NoAlertPresentException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

from django.conf import settings
from django.test import LiveServerTestCase


__all__ = [
    'json', 'datetime',
    'webdriver', 'TimeoutException', 'NoAlertPresentException',
    'By', 'EC', 'WebDriverWait', 'DesiredCapabilities', 'Options', 'Service',
    'settings', 'LiveServerTestCase',
    'TestConfig',
]

# uwsgi-djangoコンテナからアクセスできないためnginxコンテナ経由とする
kURL_PREFIX = "https://nginx"
#                            ^^^^ /app/などのURL要素をurl_configと比較評価する

# selemiumのlink.click()が失敗するため、JSによるクリック↓ を使用する
# self.driver.execute_script("arguments[0].click();", link)


class TestConfig(LiveServerTestCase):
    def setUp(self):
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--ignore-certificate-errors')  # 自己署名証明書
        options.add_experimental_option('prefs', {'loggingPrefs': {'browser': 'ALL'}})

        options.binary_location = '/usr/bin/chromium'
        service = Service('/usr/bin/chromedriver')
        self.driver = webdriver.Chrome(service=service, options=options)

        self.url_config = settings.URL_CONFIG

        self.top_url            = f"{kURL_PREFIX}{self.url_config['kSpaPongTopUrl']}"

        self.free_game_url      = f"{kURL_PREFIX}{self.url_config['kSpaFreeGame']}"
        self.tournament_url     = f"{kURL_PREFIX}{self.url_config['kSpaTournamentUrl']}"
        self.game1vs1_url       = f"{kURL_PREFIX}{self.url_config['kSpaGame1vs1Url']}"
        self.online_pong_url    = f"{kURL_PREFIX}{self.url_config['kSpaOnlinePong']}"

        self.game_history_url   = f"{kURL_PREFIX}{self.url_config['kSpaGameHistoryUrl']}"
        self.profile_url        = f"{kURL_PREFIX}{self.url_config['kSpaUserProfileUrl']}"
        self.user_info_url       = f"{kURL_PREFIX}{self.url_config['kSpaUserInfoUrl']}"
        self.user_info_base_url = f"{kURL_PREFIX}{self.url_config['kSpaUserInfoUrlBase']}"
        self.friend_url         = f"{kURL_PREFIX}{self.url_config['kSpaUserFriendUrl']}"
        self.edit_profile_url   = f"{kURL_PREFIX}{self.url_config['kSpaEditProfileUrl']}"
        self.change_avatar_url  = f"{kURL_PREFIX}{self.url_config['kSpaChangeAvatarUrl']}"

        self.dm_url             = f"{kURL_PREFIX}{self.url_config['kSpaDmUrl']}"
        self.dm_with_url        = f"{kURL_PREFIX}{self.url_config['kSpaDmWithUrl']}"
        self.dm_with_base_url   = f"{kURL_PREFIX}{self.url_config['kSpaDmWithUrlBase']}"

        self.enable_2fa_url     = f"{kURL_PREFIX}{self.url_config['kSpaAuthEnable2FaUrl']}"
        self.verify_2fa_url     = f"{kURL_PREFIX}{self.url_config['kSpaAuthVerify2FaUrl']}"
        self.login_url          = f"{kURL_PREFIX}{self.url_config['kSpaAuthLoginUrl']}"
        self.signup_url         = f"{kURL_PREFIX}{self.url_config['kSpaAuthSignupUrl']}"
        self.oauth_url          = f"{kURL_PREFIX}/accounts/oauth-ft/"

        self._access_to(self.top_url)

    def tearDown(self):
        self.driver.quit()

    ############################################################################
    # DOM要素

    def _element(self, by, value):
        # visibility_of_element_located: 指定された要素がDOMに存在し、かつ画面上に見える状態になるまで待機
        wait = WebDriverWait(driver=self.driver, timeout=10)
        element = wait.until(
            EC.visibility_of_element_located((by, value))
        )
        return element

    def _text_link_url(self, text):
        link = self._text_link(text)
        return link.get_attribute('href')

    def _text_link(self, text):
        link = self._element(By.LINK_TEXT, text)
        return link

    def _button(self, by, value):
        button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((by, value))
        )
        # button = self._element(by, value)
        return button

    ############################################################################
    # assert wrapper

    def _assert_element(self, by, value, is_displayed=True):
        elem = self._element(by, value)
        self.assertEqual(is_displayed, elem.is_displayed())

    def _assert_current_url(self, expected_url):
        self.assertEqual(self.driver.current_url, expected_url)

    def _assert_page_url_and_title(self, expecter_url, expected_title):
        # ページのURLを検証
        self._assert_current_url(expecter_url)
        # ページのタイトルを検証
        self.assertEqual(self.driver.title, expected_title)

    def _assert_message(self, expected_message):
        message_area = self._element(By.ID, "message-area")
        self.assertEqual(message_area.text, expected_message)

    ############################################################################
    # ページ遷移、操作 要素

    def _wait_invisible(self, target, timeout_sec=10):
        WebDriverWait(driver=self.driver, timeout=10).until(
            EC.invisibility_of_element_located(target)
        )

    def _wait_visible(self, target, timeout_sec=10):
        WebDriverWait(driver=self.driver, timeout=10).until(
            EC.visibility_of_element_located(target)
        )

    def _send_to_elem(self, by, elem_value, send_value):
        elem = self._element(by, elem_value)
        elem.send_keys(send_value)

    def _access_to(self, url):
        self.driver.get(url)

    def _click_link(self, target, wait_for_link_invisible=True):
        self.driver.execute_script("arguments[0].click();", target)
        if wait_for_link_invisible:
            self._wait_invisible(target)

    def _click_button(self, target, wait_for_button_invisible=True):
        self.driver.execute_script("arguments[0].click();", target)
        if wait_for_button_invisible:
            self._wait_invisible(target)

    def _screenshot(self, img_name):
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        self.driver.save_screenshot(f'trans_pj/tests/screenshot/{timestamp}_{img_name}.png')

    def _print_console_log(self):
        print("print console log: ")
        logs = self.driver.get_log('browser')
        for entry in logs:
            if entry['level'] == 'SEVERE':
                continue
            print(json.dumps(entry, indent=2))

    def _is_alert_present(self):
        """
        ページにアラートが存在するかどうかを確認するヘルパーメソッド
        """
        try:
            self.driver.switch_to.alert
            return True
        except NoAlertPresentException:
            return False

    def _close_alert(self):
        if self._is_alert_present():
            alert = self.driver.switch_to.alert
            alert.accept()

    ############################################################################
    # ページ遷移、操作 まとめ

    def _move_top_to_login(self):
        login_page_button = self._button(By.CSS_SELECTOR, ".loginButton")
        self._click_button(login_page_button, wait_for_button_invisible=True)
        self._assert_page_url_and_title(expecter_url=self.login_url,
                                        expected_title='Login')

    def _move_top_to_profile(self):
        profile_page_button = self._button(By.CSS_SELECTOR, ".profileButton")
        self._click_button(profile_page_button, wait_for_button_invisible=True)
        self._assert_page_url_and_title(expecter_url=self.profile_url,
                                        expected_title='UserProfile')

    def _login(self, email, password, wait_for_button_invisible=True):
        self._send_to_elem(By.ID, "email", email)
        self._send_to_elem(By.ID, "password", password)

        login_button = self._element(By.ID, "login-btn")
        self._click_button(login_button, wait_for_button_invisible)

    def _login_user1_from_top_page(self):
        self._move_top_to_login()

        user1_email = 'user1@example.com'
        user1_password = 'pass0123'
        self._login(user1_email, user1_password)

    def _logout(self):
        logout_page_button = self._button(By.CSS_SELECTOR, ".logoutButton")
        self._screenshot("logout 1")
        self.driver.execute_script("arguments[0].click();", logout_page_button)
        self._screenshot("logout 2")
        self.assertTrue(self._is_alert_present())

        # self._print_console_log()

        self._screenshot("logout 3")
        self._close_alert()
        self._screenshot("logout 4")
        self._wait_invisible(logout_page_button)
        self._screenshot("logout 5")
