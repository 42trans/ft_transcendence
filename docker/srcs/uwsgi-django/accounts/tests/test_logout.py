from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import TestCase


class LogoutTests(TestCase):
    kLoginName = "accounts:login"
    kLogoutName = "accounts:logout"
    kLoginURL = "accounts/login.html"
    kLogoutURL = "accounts/logout.html"
    kHomeURL = "/pong/"

    kUserEmail = "test@example.com"
    kUserNickname = "test"
    kUserPassword = "pass012345"

    def setUp(self):
        self.user = get_user_model().objects.create_user(email=self.kUserEmail,
                                                         nickname=self.kUserNickname,
                                                         password=self.kUserPassword)
        self.login_url = reverse(self.kLoginName)
        self.logout_url = reverse(self.kLogoutName)
        self.client.login(username=self.kUserEmail, password=self.kUserPassword)

    def test_logout_redirect(self):
        # login user accesses login, redirect to home
        response = self.client.get(self.login_url)
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, self.kHomeURL)

        response = self.client.get(self.logout_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, self.kLogoutURL)

        response = self.client.get(self.login_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, self.kLoginURL)


def test_user_session_ended(self):
        self.client.get(self.logout_url)
        response = self.client.get(self.logout_url)
        user = response.context.get('user')
        self.assertFalse(user.is_authenticated)
