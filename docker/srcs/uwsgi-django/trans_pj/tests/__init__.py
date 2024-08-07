import json
import datetime
import random
import string
import time
import requests
import urllib3

from selenium import webdriver
from selenium.common.exceptions import TimeoutException, NoAlertPresentException, NoSuchElementException, StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from pyotp import TOTP

from django.conf import settings
from django.test import LiveServerTestCase
from accounts.models import CustomUser

# 自己署名証明書の警告を非表示にする
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# uwsgi-djangoコンテナからアクセスできないためnginxコンテナ経由とする
kURL_PREFIX = "https://nginx"
#                            ^^^^ /app/などのURL要素をurl_configと比較評価する

# test_*.pyで使用するために__all__にも定義
__all__ = [
    'json', 'datetime', 'random', 'string', 'time',
    'webdriver',
    'TimeoutException', 'NoAlertPresentException', 'NoSuchElementException', 'StaleElementReferenceException',
    'By', 'EC', 'WebDriverWait', 'DesiredCapabilities',
    'Options', 'Service', 'ActionChains',
    'TOTP',
    'settings', 'LiveServerTestCase', 'CustomUser',
    'TestConfig',
    'kURL_PREFIX',
]


# selemiumのlink.click()が失敗するため、JSによるクリック↓ を使用する
# self.driver.execute_script("arguments[0].click();", link)


class TestConfig(LiveServerTestCase):
    def setUp(self):
        # Webdriver ############################################################
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--ignore-certificate-errors')  # 自己署名証明書
        options.add_experimental_option('prefs', {'loggingPrefs': {'browser': 'ALL'}})

        options.binary_location = '/usr/bin/chromium'
        service = Service('/usr/bin/chromedriver')
        self.driver = webdriver.Chrome(service=service, options=options)

        # const ################################################################
        # url
        self.url_config = settings.URL_CONFIG

        self.top_url            = f"{kURL_PREFIX}{self.url_config['kSpaPongTopUrl']}"

        self.game_2d_url        = f"{kURL_PREFIX}{self.url_config['kSpaGame2D']}"
        # self.game_3d_url        = f"{kURL_PREFIX}{self.url_config['kSpaGame3D']}"
        self.tournament_url     = f"{kURL_PREFIX}{self.url_config['kSpaTournamentUrl']}"

        self.game_history_url   = f"{kURL_PREFIX}{self.url_config['kSpaGameHistoryUrl']}"
        self.profile_url        = f"{kURL_PREFIX}{self.url_config['kSpaUserProfileUrl']}"
        self.user_info_url      = f"{kURL_PREFIX}{self.url_config['kSpaUserInfoUrl']}"
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

        # nickname
        self.nickname_max_len = CustomUser.kNICKNAME_MAX_LENGTH

        # set up operation #####################################################
        self._access_to(self.top_url)

    def tearDown(self):
        self.driver.quit()

    ############################################################################
    # DOM要素

    def _element(self, by, value, timeout=10, retries=5, verbose=True):
        """要素を取得する 必要に応じて再取得を試みる """
        for attempt in range(retries):
            try:
                wait = WebDriverWait(driver=self.driver, timeout=timeout)
                element = wait.until(EC.visibility_of_element_located((by, value)))

                self.assertTrue(element.is_displayed(),
                                msg=f"Element `{value}` is not displayed")
                return element
            except StaleElementReferenceException:
                if verbose:
                    print(f"element(): StaleElementReferenceException: by:{by}, value:{value}, {attempt + 1}/{retries}")
                if attempt < retries - 1:
                    time.sleep(1)  # 少し待ってから再試行
                else:
                    raise
            except NoSuchElementException:
                if verbose:
                    print(f"element(): NoSuchElementException: by:{by}, value:{value}, {attempt + 1}/{retries}")
                if attempt < retries - 1:
                    time.sleep(1)  # 少し待ってから再試行
                else:
                    raise
            except TimeoutException:
                if verbose:
                    print(f"element(): TimeoutException: by:{by}, value:{value}, {attempt + 1}/{retries}")
                if attempt < retries - 1:
                    time.sleep(1)  # 少し待ってから再試行
                else:
                    raise

    def _text_link_url(self, text):
        link = self._text_link(text)
        return link.get_attribute('href')

    def _text_link(self, text):
        # link = self._element(By.LINK_TEXT, text)
        link = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.LINK_TEXT, text))
        )
        return link

    def _button(self, by, value):
        button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((by, value))
        )
        # button = self._element(by, value)
        return button

    def _alert(self, expected_message):
        WebDriverWait(driver=self.driver, timeout=10).until(
            EC.alert_is_present(),
            message="Waiting for alert to appear"
        )
        alert = self.driver.switch_to.alert
        self.assertEqual(alert.text,
                         expected_message,
                         msg=f"alert message should be `{expected_message}`")
        return alert

    ############################################################################
    # assert wrapper

    def _assert_element(self, by, value, is_displayed=True):
        elem = self._element(by, value)
        self.assertEqual(is_displayed, elem.is_displayed())

    def _assert_current_url(self, expected_url):
        self.assertEqual(self.driver.current_url, expected_url)

    def _assert_page_url_and_title(self, expecter_url, expected_title, timeout=10):
        wait = WebDriverWait(self.driver, timeout=timeout)
        wait.until(EC.title_is(expected_title))

        # ページのURLを検証
        self._assert_current_url(expecter_url)
        # ページのタイトルを検証
        self.assertEqual(self.driver.title, expected_title)

    def _assert_element_exists(self, by, value):
        elem = self._element(by, value)
        self.assertTrue(elem.is_displayed())

    def _assert_message(self, expected_message, value="message-area"):
        message_area = self._element(By.ID, value)
        self._wait_display_message(expected_message, value)
        self.assertEqual(message_area.text, expected_message)

    def _assert_is_2fa_enabled(self, expected_2fa_enabled: bool):
        twofa_status_element = self._element(By.ID, "2fa-status")
        actual_status_text = twofa_status_element.text

        # Disable2FA, Enable2FAリンク含む要素になっている
        expected_status_text = "2FA: ✅Enabled Disable2FA" if expected_2fa_enabled else "2FA: Disabled Enable2FA"
        self.assertEqual(actual_status_text, expected_status_text)

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

    def _wait_send_keys(self, by, elem_value, send_value):
        WebDriverWait(self.driver, 10).until(
            EC.text_to_be_present_in_element_value((by, elem_value), send_value)
        )

    def _wait_to_be_url(self, url):
        WebDriverWait(self.driver, 10).until(
            EC.url_to_be(url)
        )

    def _wait_display_message(self, expected_message, value):
        WebDriverWait(driver=self.driver, timeout=10).until(
            EC.text_to_be_present_in_element(
                locator=(By.ID, value),
                text_=expected_message
            )
        )

    def _send_to_elem(self, by, elem_value, send_value, retries=5):
        wait = WebDriverWait(driver=self.driver, timeout=20)

        for attempt in range(retries):
            try:
                # elem = self._element(by, elem_value)
                elem = wait.until(EC.presence_of_element_located((by, elem_value)))
                elem.clear()  # 入力済みのテキストをクリア
                elem.send_keys(send_value)
                return
            except (StaleElementReferenceException, TimeoutException):
                if attempt < retries - 1:
                    print(f"send_to_elem(): {elem_value}, retry: {attempt + 1}/{retries}")
                    time.sleep(3)  # 少し待ってから再試行
                else:
                    raise

    def _access_to(self, url, wait_to_be_url=True):
        self.driver.get(url)
        # time.sleep(0.1)  # 明示的に待機
        time.sleep(1)  # 明示的に待機
        if wait_to_be_url:
            self._wait_to_be_url(url)

    def _click_link(self, target, wait_for_link_invisible=False):
        url = target.get_attribute("href")
        self._access_to(url)
        # self.driver.execute_script("arguments[0].click();", target)
        # time.sleep(1)  # 明示的に待機
        #
        # if wait_for_link_invisible:
        #     self._wait_invisible(target)
        # else:
        #     self._wait_to_be_url(url)
        # self.driver.refresh()

    def _click_button(self, target, wait_for_button_invisible=True):
        self.driver.execute_script("arguments[0].click();", target)
        if wait_for_button_invisible:
            self._wait_invisible(target)
            # self.driver.refresh()

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

    def _close_alert(self, expected_message):
        alert = self._alert(expected_message)
        alert.accept()

    def _dismiss_alert(self, expected_message):
        """
        confirm アラートダイアログの"Cancel"
        """
        alert = self._alert(expected_message)
        alert.dismiss()

    def _generate_random_string(self, length=10):
        characters = string.ascii_letters + string.digits
        random_string = ''.join(random.choice(characters) for _ in range(length))
        return random_string

    ############################################################################
    # ページ遷移、操作 まとめ

    def _move_top_to_login(self):
        login_page_link = self._text_link("Log-in")
        self._click_link(login_page_link, wait_for_link_invisible=False)
        self._assert_page_url_and_title(expecter_url=self.login_url,
                                        expected_title='Login')

    def _move_top_to_signup(self):
        signup_page_link = self._text_link("Sign-up")
        self._click_link(signup_page_link, wait_for_link_invisible=False)
        self._assert_page_url_and_title(expecter_url=self.signup_url,
                                        expected_title='Signup')

    def _move_top_to_profile(self):
        profile_page_button = self._text_link("Profile")
        self._click_link(profile_page_button, wait_for_link_invisible=False)
        self._assert_page_url_and_title(expecter_url=self.profile_url,
                                        expected_title='UserProfile')

    def _move_top_to_friend(self):
        friend_page_link = self._text_link("Friend")
        self._click_link(friend_page_link, wait_for_link_invisible=False)
        self._assert_page_url_and_title(expecter_url=self.friend_url,
                                        expected_title='Friend')

    def _move_top_to_dm(self):
        friend_page_link = self._text_link("DM")
        self._click_link(friend_page_link, wait_for_link_invisible=False)
        self._assert_page_url_and_title(expecter_url=self.dm_url,
                                        expected_title='DMSessions')

    def _move_top_to_tournament(self):
        tournament_page_link = self._text_link("Tournament")
        self._click_link(tournament_page_link, wait_for_link_invisible=False)
        self._assert_page_url_and_title(expecter_url=self.tournament_url,
                                        expected_title='Tournament')

    def _login(self, email, password, wait_for_button_invisible=True):
        self._move_top_to_login()

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
        logout_page_button = self._button(By.CSS_SELECTOR, "header .logoutButton")
        self.driver.execute_script("arguments[0].click();", logout_page_button)
        self._close_alert(expected_message="You have been successfully logout")
        self._wait_invisible(logout_page_button)
        # self._screenshot("logout 2")

    def _create_new_user(self, email, nickname, password, is_enable_2fa=False):
        self._move_top_to_signup()

        self._send_to_elem(By.ID, "email", email)
        self._send_to_elem(By.ID, "nickname", nickname)
        self._send_to_elem(By.ID, "password1", password)
        self._send_to_elem(By.ID, "password2", password)
        signup_button = self._element(By.ID, "sign-submit")
        self._click_button(signup_button, wait_for_button_invisible=True)

        set_up_key = None
        if is_enable_2fa:
            self.driver.refresh()
            self._move_top_to_profile()
            self.driver.refresh()
            set_up_key = self._setting_enable_2fa()
            self._assert_is_2fa_enabled(expected_2fa_enabled=True)

        id = self._get_id()

        self._logout()
        return id, set_up_key

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

    def _verify_login_2fa(self, set_up_key: str):
        verify2fa_button = self._button(By.CSS_SELECTOR, ".verify2FaButton")

        otp_token = self._get_otp_token(set_up_key)
        self._send_to_elem(By.ID, "token", otp_token)

        self._click_button(verify2fa_button)

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

    def _send_dm_with_form(self, target_nickname):
        self._send_to_elem(By.ID, "nickname-input", target_nickname)
        signup_button = self._element(By.ID, "nickname-submit")
        self._click_button(signup_button, wait_for_button_invisible=True)

    def _get_id(self):
        user_profile_url = f"{kURL_PREFIX}/accounts/api/user/profile/"
        session = requests.Session()

        for cookie in self.driver.get_cookies():
            session.cookies.set(cookie['name'], cookie['value'])

        response = session.get(user_profile_url, verify=False)
        # print(response.text)  # レスポンスの内容を出力
        self.assertEqual(response.status_code, 200)
        return response.json()['id']
