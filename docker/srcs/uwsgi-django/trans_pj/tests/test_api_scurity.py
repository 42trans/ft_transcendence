# trans_pj/tests/test_api_security.py

import requests
import urllib3
from django.test import TestCase
from django.urls import reverse
from django.urls.resolvers import URLPattern

from accounts.urls_api import urlpatterns as accounts_api_urls
from chat.urls_api import urlpatterns as chat_api_urls
from pong.urls_api import urlpatterns as pong_api_urls

# 自己署名証明書の警告を非表示にする
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


kURL_PREFIX = "https://nginx"


class AccountsAPITestCase(TestCase):
    def setUp(self):
        exclude_urls = {
            "api/signup/",
            "api/login/",
            "api/verify_2fa/",
            "api/is-user-logged-in/",
            "api/is-user-enabled2fa/",
            "oauth-ft/callback/",
        }
        api_urls = []
        for url in accounts_api_urls:
            if isinstance(url, URLPattern):
                if str(url.pattern) in exclude_urls:
                    continue

                if '<str:nickname>' in str(url.pattern):
                    api_url = str(url.pattern).replace('<str:nickname>', 'user1')
                elif '<int:user_id>' in str(url.pattern):
                    api_url = str(url.pattern).replace('<int:user_id>', '1')
                else:
                    api_url = str(url.pattern)
            api_url = f"{kURL_PREFIX}/accounts/{api_url}"
            api_urls.append(api_url)

        self.api_urls = api_urls

    def test_api_unauthorized(self):
        print("[AccountsAPI Test]")
        print(f"api_urls: {self.api_urls}")

        for url in self.api_urls:
            print(f" [Testing: {url}]")

            response = requests.get(url, verify=False)
            print(f"  -> GET : {response.status_code}")
            self.assertIn(response.status_code,
                          [401, 405],
                          f"Expected 401 status code for {url}, but got {response.status_code}")

            response = requests.post(url, verify=False)
            print(f"  -> POST: {response.status_code}")
            self.assertIn(response.status_code,
                          [401, 405],
                          f"Expected 401 status code for {url}, but got {response.status_code}")


class ChatAPITestCase(TestCase):
    def setUp(self):
        api_urls = []
        for url in chat_api_urls:
            if isinstance(url, URLPattern):
                if '<str:target_nickname>' in str(url.pattern):
                    api_url = str(url.pattern).replace('<str:target_nickname>', 'user1')
                else:
                    api_url = str(url.pattern)
            api_url = f"{kURL_PREFIX}/chat/{api_url}"
            api_urls.append(api_url)

        self.api_urls = api_urls

    def test_api_unauthorized(self):
        print("[ChatAPI Test]")
        print(f"api_urls: {self.api_urls}")

        for url in self.api_urls:
            print(f" [Testing: {url}]")

            response = requests.get(url, verify=False)
            print(f"  -> GET : {response.status_code}")
            self.assertIn(response.status_code,
                          [401, 405],
                          f"Expected 401 status code for {url}, but got {response.status_code}")

            response = requests.post(url, verify=False)
            print(f"  -> POST: {response.status_code}")
            self.assertIn(response.status_code,
                          [401, 405],
                          f"Expected 401 status code for {url}, but got {response.status_code}")


class PongAPITestCase(TestCase):
    def setUp(self):
        exclude_urls = {
            "save_testnet/<str:testnet_name>/",
            "fetch_testnet/<str:testnet_name>/",
        }
        api_urls = []
        for url in pong_api_urls:
            if isinstance(url, URLPattern):
                if str(url.pattern) in exclude_urls:
                    continue

                if '<int:tournament_id>' in str(url.pattern):
                    api_url = str(url.pattern).replace('<int:tournament_id>', '1')
                elif '<int:round_number>' in str(url.pattern):
                    api_url = str(url.pattern).replace('<int:round_number>', '1')
                else:
                    api_url = str(url.pattern)
            api_url = f"{kURL_PREFIX}/pong/api/{api_url}"
            api_urls.append(api_url)

        self.api_urls = api_urls

    def test_api_unauthorized(self):
        print("[PongAPI Test]")
        print(f"api_urls: {self.api_urls}")

        for url in self.api_urls:
            print(f" [Testing: {url}]")

            response = requests.get(url, verify=False)
            print(f"  -> GET : {response.status_code}")
            self.assertIn(response.status_code,
                          [401, 405],
                          f"Expected 401 status code for {url}, but got {response.status_code}")

            response = requests.post(url, verify=False)
            print(f"  -> POST: {response.status_code}")
            self.assertIn(response.status_code,
                          [401, 405],
                          f"Expected 401 status code for {url}, but got {response.status_code}")
