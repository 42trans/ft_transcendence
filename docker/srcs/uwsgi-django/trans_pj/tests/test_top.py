import datetime
from selenium import webdriver
from selenium.webdriver.support import expected_conditions as EC
# find_element() メソッドを呼び出す際に要素を見つける方法を指定するために使用
from selenium.webdriver.common.by import By
# 要素が特定の条件を満たすまで待機するために使用
from selenium.webdriver.support.ui import WebDriverWait
# WebDriverWait と組み合わせて、要素が特定の条件を満たすまで待機するために使用
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException  # ここを追加

import time

from django.conf import settings
from django.test import LiveServerTestCase


# uwsgi-djangoコンテナからアクセスできないためnginxコンテナ経由とする
kURL_PREFIX = "https://nginx"
#                            ^^^^ /app/などのURL要素をurl_configと比較評価する

# selemiumのlink.click()が失敗するため、JSによるクリック↓ を使用する
# self.driver.execute_script("arguments[0].click();", link)


class TopPageTest(LiveServerTestCase):
    def setUp(self):
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--ignore-certificate-errors')  # 自己署名証明書

        chrome_options.binary_location = '/usr/bin/chromium'
        chrome_service = Service('/usr/bin/chromedriver')
        self.driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

        self.url_config = settings.URL_CONFIG

        self.top_url    = f"{kURL_PREFIX}{self.url_config['kSpaPongTopUrl']}"
        self.login_url  = f"{kURL_PREFIX}{self.url_config['kSpaAuthLoginUrl']}"
        self.signup_url = f"{kURL_PREFIX}{self.url_config['kSpaAuthSignupUrl']}"
        self.ftauth_url = f"{kURL_PREFIX}/accounts/oauth-ft/"

        self.__access_to(self.top_url)

    def tearDown(self):
        self.driver.quit()

    def test_top_page(self):
        self.__assert_page_url_and_title(expecter_url=self.top_url,
                                         expected_title='PongTop')
        # self.__screenshot("top_page")

    def test_login_page(self):
        """
        login pageの評価
        """
        self.__move_top_to_login()

        # フォームの要素の検証 ####################################################
        self.__assert_element(By.ID, "email", is_displayed=True)
        self.__assert_element(By.ID, "password", is_displayed=True)
        self.__assert_element(By.ID, "login-btn", is_displayed=True)

        # "Log in to your 42 account" リンク先URLの検証 ##########################
        actual_42auth_url = self.__text_link_url("Log in to your 42 account")
        expected_42auth_url = self.ftauth_url
        self.assertEqual(actual_42auth_url, expected_42auth_url)

        # "Create an Account" リンク先URLの検証 ##################################
        actual_create_account_url = self.__text_link_url("Create an Account")
        expected_create_account_url = self.signup_url
        self.assertEqual(actual_create_account_url, expected_create_account_url)

    def test_login_success(self):
        """
        login成功
        """
        self.__move_top_to_login()

        user1_email = 'user1@example.com'
        user1_password = 'pass0123'

        self.__login(user1_email, user1_password)
        self.__assert_current_url(self.top_url)
        # self.__screenshot("login success")

    def test_login_failure(self):
        """
        login失敗
        """
        self.__move_top_to_login()

        wrong_email = 'nothing@example.com'
        password = 'pass0123'

        self.__login(wrong_email, password, wait_for_button_invisible=False)
        self.__assert_current_url(self.login_url)
        self.__assert_message("Invalid credentials")
        # self.__screenshot("login failure")

    ############################################################################
    # DOM要素

    def __element(self, by, value):
        # visibility_of_element_located: 指定された要素がDOMに存在し、かつ画面上に見える状態になるまで待機
        wait = WebDriverWait(driver=self.driver, timeout=10)
        element = wait.until(
            EC.visibility_of_element_located((by, value))
        )
        return element

    def __text_link_url(self, text):
        link = self.__text_link(text)
        return link.get_attribute('href')

    def __text_link(self, text):
        link = self.__element(By.LINK_TEXT, text)
        return link

    def __button(self, by, value):
        button = self.__element(by, value)
        return button

    ############################################################################
    # assert wrapper

    def __assert_element(self, by, value, is_displayed=True):
        elem = self.__element(by, value)
        self.assertEqual(is_displayed, elem.is_displayed())

    def __assert_current_url(self, expected_url):
        self.assertEqual(self.driver.current_url, expected_url)

    def __assert_page_url_and_title(self, expecter_url, expected_title):
        # ページのURLを検証
        self.__assert_current_url(expecter_url)
        # ページのタイトルを検証
        self.assertEqual(self.driver.title, expected_title)

    def __assert_message(self, expected_message):
        message_area = self.__element(By.ID, "message-area")
        self.assertEqual(message_area.text, expected_message)

    ############################################################################
    # ページ遷移、操作 要素

    def __wait_invisible(self, target, timeout_sec=10):
        WebDriverWait(driver=self.driver, timeout=10).until(
            EC.invisibility_of_element_located(target)
        )

    def __wait_visible(self, target, timeout_sec=10):
        WebDriverWait(driver=self.driver, timeout=10).until(
            EC.visibility_of_element_located(target)
        )

    def __send_to_elem(self, by, elem_value, send_value):
        elem = self.__element(by, elem_value)
        elem.send_keys(send_value)

    def __access_to(self, url):
        self.driver.get(url)

    def __click_link(self, target, wait_for_link_invisible=True):
        self.driver.execute_script("arguments[0].click();", target)
        if wait_for_link_invisible:
            self.__wait_invisible(target)

    def __click_button(self, target, wait_for_button_invisible=True):
        self.driver.execute_script("arguments[0].click();", target)
        if wait_for_button_invisible:
            self.__wait_invisible(target)

    def __screenshot(self, img_name):
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        self.driver.save_screenshot(f'trans_pj/tests/screenshot/{timestamp}_{img_name}.png')

    ############################################################################
    # ページ遷移、操作 まとめ

    def __move_top_to_login(self):
        login_page_button = self.__button(By.CSS_SELECTOR, ".loginButton")
        self.__click_button(login_page_button, wait_for_button_invisible=True)
        self.__assert_page_url_and_title(expecter_url=self.login_url,
                                         expected_title='Login')

    def __login(self, email, password, wait_for_button_invisible=True):
        self.__send_to_elem(By.ID, "email", email)
        self.__send_to_elem(By.ID, "password", password)

        login_button = self.__element(By.ID, "login-btn")
        self.__click_button(login_button, wait_for_button_invisible)
