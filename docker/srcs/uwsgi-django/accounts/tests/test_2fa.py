from base64 import b32encode
import pyotp
import time

from django.contrib.auth import get_user_model, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.messages import get_messages
from django_otp.util import random_hex
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.test import TestCase
from django.urls import reverse, resolve

from accounts.forms import Enable2FAForm, Verify2FAForm
from accounts.views.two_factor_auth import Enable2FaView, Verify2FaView


class Enable2FaFormTests(TestCase):
    kUserEmail = 'test@example.com'
    kUserNickname = 'test'
    kUserPassword = 'pass012345'

    kLoginName = "accounts:login"
    kEnable2FaName = "accounts:enable_2fa"
    kEnable2FaURL = "/accounts/verify/enable_2fa/"

    def setUp(self):

        User = get_user_model()
        user = User.objects.create_user(email=self.kUserEmail,
                                        nickname=self.kUserNickname,
                                        password=self.kUserPassword)
        user.save()

        login_url = reverse(self.kLoginName)
        user_field = {
            'username'  : self.kUserEmail,
            'password'  : self.kUserPassword,
        }
        self.response = self.client.post(login_url, user_field)
        self.assertTrue('_auth_user_id' in self.client.session)

        # access to enable_2fa
        enable_2fa_url = reverse(self.kEnable2FaName)
        self.response = self.client.get(enable_2fa_url)

    def test_status_code(self):
        self.assertEqual(self.response.status_code, 200)

    def test_url_resolve_view(self):
        enable_2fa_view = resolve(self.kEnable2FaURL)
        self.assertEqual(enable_2fa_view.func.view_class, Enable2FaView)

    def test_csrf(self):
        self.assertContains(self.response, 'csrfmiddlewaretoken')

    def test_contains_form(self):
        form = self.response.context.get('form')
        self.assertIsInstance(form, Enable2FAForm)

    def test_form_inputs(self):
        '''
        The edit form should contain 5 <input> tags:
         (csrf), token
        '''
        self.assertContains(self.response, '<input', 2)
        self.assertContains(self.response, 'type="hidden"', 1)  # csrf
        self.assertContains(self.response, 'type="text"', 1)    # token

    def test_input_invalid_token(self):
        invalid_tokens = [
            '', 'a', '@', '.',
            'abcdef', '123abc'
            '000000', '999999',
            '+000000', '-00000', '0000.0',
            '000000a', 'aaaaaa',
            '00000000', '000000-0000',
            ' 000000 ',
            '０００００００',
        ]

        for token in invalid_tokens:
            form = Enable2FAForm(data={'token': token})
            self.assertFalse(form.is_valid())


class Verify2FaFormTests(TestCase):
    kUserEmail = 'test@example.com'
    kUserNickname = 'test'
    kUserPassword = 'pass012345'

    kLoginName = "accounts:login"
    kVerify2FaURL = "/accounts/verify/verify_2fa/"

    def setUp(self):
        User = get_user_model()
        user = User.objects.create_user(email=self.kUserEmail,
                                        nickname=self.kUserNickname,
                                        password=self.kUserPassword,
                                        enable_2fa=True)
        user.save()

        login_url = reverse(self.kLoginName)
        user_field = {
            'username'  : self.kUserEmail,
            'password'  : self.kUserPassword,
        }
        self.response = self.client.post(login_url, user_field, follow=True)
        # login -> redirect to verify_2fa

    def test_authenticate(self):
        # not logged in until OTP auth
        self.assertFalse('_auth_user_id' in self.client.session)

    def test_status_code(self):
        self.assertEqual(self.response.status_code, 200)

    def test_url_resolve_view(self):
        enable_2fa_view = resolve(self.kVerify2FaURL)
        self.assertEqual(enable_2fa_view.func.view_class, Verify2FaView)

    def test_csrf(self):
        self.assertContains(self.response, 'csrfmiddlewaretoken')

    def test_contains_form(self):
        form = self.response.context.get('form')
        self.assertIsInstance(form, Verify2FAForm)

    def test_form_inputs(self):
        '''
        The edit form should contain 5 <input> tags:
         (csrf), token
        '''
        self.assertContains(self.response, '<input', 2)
        self.assertContains(self.response, 'type="hidden"', 1)  # csrf
        self.assertContains(self.response, 'type="text"', 1)    # token


class EnableAndVerify2FaTests(TestCase):
    """
    enable2fa and logged in user access to
     accounts:enable_2fa  -> redirect to "accounts:user"
     accounts:verify_2fa  -> redirect to "/pong/"
     accounts:disable_2fa -> 2fa disabled -> redirect to "accounts:user"
    """
    kUserEmail = 'test@example.com'
    kUserNickname = 'test'
    kUserPassword = 'pass012345'

    kLoginName = "accounts:login"

    kEnable2FaName = "accounts:enable_2fa"
    kEnable2FaURL = "/accounts/verify/enable_2fa/"

    kVerify2FaName = "accounts:verify_2fa"
    kVerify2FaURL = "/accounts/verify/verify_2fa/"

    kDisable2FaName = "accounts:disable_2fa"
    kDisable2FaURL = "/accounts/verify/disable_2fa/"

    kUserPageName = "accounts:user"
    kHomeURL = "/pong/"

    def setUp(self):
        self.enable_2fa_url = reverse(self.kEnable2FaName)
        self.verify_2fa_url = reverse(self.kVerify2FaName)
        self.disable_2fa_url = reverse(self.kDisable2FaName)
        self.user_page_url = reverse(self.kUserPageName)
        self.login_url = reverse(self.kLoginName)

        User = get_user_model()
        self.user = User.objects.create_user(email=self.kUserEmail,
                                             nickname=self.kUserNickname,
                                             password=self.kUserPassword,
                                             enable_2fa=False)  # disable
        self.user.save()
        self.client.force_login(self.user)

    def test_enable_2fa(self):
        """
        testing enable 2fa use post method for Enable2FaView
        """
        self.user.refresh_from_db()
        self.assertFalse(self.user.enable_2fa)  # disable

        response = self.client.get(self.enable_2fa_url)
        setup_key = response.context['setup_key']
        secret_key_base32 = b32encode(bytes.fromhex(setup_key)).decode('utf-8')
        totp = pyotp.TOTP(secret_key_base32)
        otp_token = totp.now()

        response = self.client.post(self.enable_2fa_url, {'token': otp_token}, follow=True)
        # print(f"form.errors:[{response.context['form'].errors}]")

        self.assertRedirects(response, self.user_page_url)   # succeed enable2fa -> redirect to user

        self.assertTrue('_auth_user_id' in self.client.session)  # login

        self.user.enable_2fa = True

        self.user.refresh_from_db()
        self.assertTrue(self.user.enable_2fa)  # enable

    def test_verify_2fa(self):
        # enable 2fa and logout
        self.test_enable_2fa()
        self.client.logout()

        # login
        user_field = {
            'username'  : self.kUserEmail,
            'password'  : self.kUserPassword,
        }
        response = self.client.post(self.login_url, user_field, follow=True)
        self.assertFalse('_auth_user_id' in self.client.session)  # login yet

        # verify 2fa form
        enable_2fa_view = resolve(self.kVerify2FaURL)
        self.assertEqual(enable_2fa_view.func.view_class, Verify2FaView)

        devices = TOTPDevice.objects.filter(user=self.user, confirmed=True)
        device = devices.first()
        totp = pyotp.TOTP(b32encode(bytes.fromhex(device.key)).decode('utf-8'))
        otp_token = totp.now()

        # verify
        response = self.client.post(self.verify_2fa_url, {'token': otp_token}, follow=True)
        self.assertRedirects(response, self.kHomeURL)

        self.assertIn('_auth_user_id', self.client.session)  # login



class Disable2FaTests(TestCase):
    kUserEmail = 'test@example.com'
    kUserNickname = 'test'
    kUserPassword = 'pass012345'

    kDisable2FaName = "accounts:disable_2fa"

    kUserPageName = "accounts:user"

    def setUp(self):
        self.disable_2fa_url = reverse(self.kDisable2FaName)
        self.user_page_url = reverse(self.kUserPageName)

        User = get_user_model()
        self.user = User.objects.create_user(email=self.kUserEmail,
                                             nickname=self.kUserNickname,
                                             password=self.kUserPassword,
                                             enable_2fa=True)  # enable
        self.user.save()
        self.client.force_login(self.user)

    def test_access_to_disable_2fa(self):
        self.user.refresh_from_db()
        self.assertTrue(self.user.enable_2fa)  # enable

        self.response = self.client.get(self.disable_2fa_url, follow=True)
        self.assertRedirects(self.response, self.user_page_url)

        self.user.refresh_from_db()
        self.assertFalse(self.user.enable_2fa)  # disabled

    def test_re_access_to_disable_2fa(self):
        self.user.refresh_from_db()
        self.assertTrue(self.user.enable_2fa)  # enable

        self.response = self.client.get(self.disable_2fa_url, follow=True)
        self.assertRedirects(self.response, self.user_page_url)

        self.user.refresh_from_db()
        self.assertFalse(self.user.enable_2fa)  # disabled

        self.response = self.client.get(self.disable_2fa_url, follow=True)
        self.assertRedirects(self.response, self.user_page_url)

        self.user.refresh_from_db()
        self.assertFalse(self.user.enable_2fa)  # disable


class EnableUserAccessTests(TestCase):
    """
    enable2fa and logged in user access to
     accounts:enable_2fa  -> redirect to "accounts:user"
     accounts:verify_2fa  -> redirect to "/pong/"
     accounts:disable_2fa -> 2fa disabled -> redirect to "accounts:user"
    """
    kUserEmail = 'test@example.com'
    kUserNickname = 'test'
    kUserPassword = 'pass012345'

    kLoginName = "accounts:login"

    kEnable2FaName = "accounts:enable_2fa"
    kEnable2FaURL = "/accounts/verify/enable_2fa/"

    kVerify2FaName = "accounts:verify_2fa"
    kVerify2FaURL = "/accounts/verify/verify_2fa/"

    kDisable2FaName = "accounts:disable_2fa"
    kDisable2FaURL = "/accounts/verify/disable_2fa/"

    kUserPageName = "accounts:user"
    kHomeURL = "/pong/"

    def setUp(self):
        self.enable_2fa_url = reverse(self.kEnable2FaName)
        self.verify_2fa_url = reverse(self.kVerify2FaName)
        self.disable_2fa_url = reverse(self.kDisable2FaName)
        self.user_page_url = reverse(self.kUserPageName)

        User = get_user_model()
        self.user = User.objects.create_user(email=self.kUserEmail,
                                        nickname=self.kUserNickname,
                                        password=self.kUserPassword,
                                        enable_2fa=True)  # enable
        self.user.save()
        self.client.force_login(self.user)

    def test_access_to_enable_2fa(self):
        self.response = self.client.get(self.enable_2fa_url, follow=True)
        self.assertRedirects(self.response, self.user_page_url)
        self.assertTrue(self.user.enable_2fa)

    def test_access_to_verify_2fa(self):
        self.response = self.client.get(self.verify_2fa_url, follow=True)
        self.assertRedirects(self.response, self.kHomeURL)
        self.assertTrue(self.user.enable_2fa)

    def test_access_to_disable_2fa(self):
        self.response = self.client.get(self.disable_2fa_url, follow=True)
        self.assertRedirects(self.response, self.user_page_url)

        self.user.refresh_from_db()
        self.assertFalse(self.user.enable_2fa)  # disabled


class DisableUserAccessTests(TestCase):
    """
    disable2fa and logged in user access to
     accounts:enable_2fa  -> display enable_2fa page
     accounts:verify_2fa  -> redirect to "/pong/"
     accounts:disable_2fa -> redirect to "accounts:user"
    """
    kUserEmail = 'test@example.com'
    kUserNickname = 'test'
    kUserPassword = 'pass012345'

    kLoginName = "accounts:login"

    kEnable2FaName = "accounts:enable_2fa"
    kEnable2FaURL = "/accounts/verify/enable_2fa/"

    kVerify2FaName = "accounts:verify_2fa"
    kVerify2FaURL = "/accounts/verify/verify_2fa/"

    kDisable2FaName = "accounts:disable_2fa"
    kDisable2FaURL = "/accounts/verify/disable_2fa/"

    kUserPageName = "accounts:user"
    kHomeURL = "/pong/"

    def setUp(self):
        self.enable_2fa_url = reverse(self.kEnable2FaName)
        self.verify_2fa_url = reverse(self.kVerify2FaName)
        self.disable_2fa_url = reverse(self.kDisable2FaName)
        self.user_page_url = reverse(self.kUserPageName)

        User = get_user_model()
        self.user = User.objects.create_user(email=self.kUserEmail,
                                             nickname=self.kUserNickname,
                                             password=self.kUserPassword,
                                             enable_2fa=False)  # disable
        self.user.save()
        self.client.force_login(self.user)

    def test_access_to_enable_2fa(self):
        self.response = self.client.get(self.enable_2fa_url, follow=True)
        enable_2fa_view = resolve(self.kEnable2FaURL)
        self.assertEqual(enable_2fa_view.func.view_class, Enable2FaView)
        self.assertFalse(self.user.enable_2fa)

    def test_access_to_verify_2fa(self):
        self.response = self.client.get(self.verify_2fa_url, follow=True)
        self.assertRedirects(self.response, self.kHomeURL)
        self.assertFalse(self.user.enable_2fa)

    def test_access_to_disable_2fa(self):
        self.response = self.client.get(self.disable_2fa_url, follow=True)
        self.assertRedirects(self.response, self.user_page_url)

        self.user.refresh_from_db()
        self.assertFalse(self.user.enable_2fa)


class UnLoginedUserAccessTests(TestCase):
    """
    un logged in user access to
     accounts:enable_2fa  -> redirect to "accounts:login"
     accounts:verify_2fa  -> redirect to "accounts:login"
     accounts:disable_2fa -> redirect to "accounts:login"
    """
    kUserEmail = 'test@example.com'
    kUserNickname = 'test'
    kUserPassword = 'pass012345'

    kLoginName = "accounts:login"

    kEnable2FaName = "accounts:enable_2fa"
    kEnable2FaURL = "/accounts/verify/enable_2fa/"

    kVerify2FaName = "accounts:verify_2fa"
    kVerify2FaURL = "/accounts/verify/verify_2fa/"

    kDisable2FaName = "accounts:disable_2fa"
    kDisable2FaURL = "/accounts/verify/disable_2fa/"

    kUserPageName = "accounts:user"
    kHomeURL = "/pong/"

    def setUp(self):
        self.enable_2fa_url = reverse(self.kEnable2FaName)
        self.verify_2fa_url = reverse(self.kVerify2FaName)
        self.disable_2fa_url = reverse(self.kDisable2FaName)
        self.user_page_url = reverse(self.kUserPageName)
        self.login_url = reverse(self.kLoginName)
        self.not_login_user_redirect_to = f"{self.login_url}?next="

    def test_access_to_enable_2fa(self):
        self.response = self.client.get(self.enable_2fa_url, follow=True)
        redirect_to = self.not_login_user_redirect_to + self.enable_2fa_url
        self.assertRedirects(self.response, redirect_to)

    def test_access_to_verify_2fa(self):
        self.response = self.client.get(self.verify_2fa_url, follow=True)
        self.assertRedirects(self.response, self.login_url)  # LoginRequiredMixinでないためnextなし

    def test_access_to_disable_2fa(self):
        self.response = self.client.get(self.disable_2fa_url, follow=True)
        redirect_to = self.not_login_user_redirect_to + self.disable_2fa_url
        self.assertRedirects(self.response, redirect_to)
