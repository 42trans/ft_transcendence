from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.messages import get_messages
from django.urls import reverse, resolve
from django.test import TestCase
from accounts.forms import UserEditForm
from accounts.views.user import EditUserProfileView


class NotLoginUserAccessEnable2FaTests(TestCase):
    kEnable2FaName = "accounts:enable_2fa"
    kUserPageName = "accounts:user"
    kLoginName = "accounts:login"

    def setUp(self):
        self.enable_2fa_url = reverse(self.kEnable2FaName)
        self.login_url = reverse(self.kLoginName)
        self.not_login_user_redirect_to = f"{self.login_url}?next={self.enable_2fa_url}"

        self.response = self.client.get(self.enable_2fa_url)

    def test_status_code(self):
        self.assertEqual(self.response.status_code, 302)

    def test_redirect(self):
        self.assertRedirects(self.response, self.not_login_user_redirect_to)


class NotLoginUserAccessVerify2FaTests(TestCase):
    kVerify2FaName = "accounts:verify_2fa"
    kUserPageName = "accounts:user"
    kLoginName = "accounts:login"

    def setUp(self):
        self.verify_2fa_url = reverse(self.kVerify2FaName)
        self.login_url = reverse(self.kLoginName)
        self.not_login_user_redirect_to = f"{self.login_url}"  # LoginRequiredMixinでないためnextなし

        self.response = self.client.get(self.verify_2fa_url)

    def test_status_code(self):
        self.assertEqual(self.response.status_code, 302)

    def test_redirect(self):
        self.assertRedirects(self.response, self.not_login_user_redirect_to)


class NotLoginUserAccessDisable2FaTests(TestCase):
    kDisable2FaName = "accounts:disable_2fa"
    kUserPageName = "accounts:user"
    kLoginName = "accounts:login"

    def setUp(self):
        self.disable_2fa_url = reverse(self.kDisable2FaName)
        self.login_url = reverse(self.kLoginName)
        self.not_login_user_redirect_to = f"{self.login_url}?next={self.disable_2fa_url}"

        self.response = self.client.get(self.disable_2fa_url)

    def test_status_code(self):
        self.assertEqual(self.response.status_code, 302)

    def test_redirect(self):
        self.assertRedirects(self.response, self.not_login_user_redirect_to)
