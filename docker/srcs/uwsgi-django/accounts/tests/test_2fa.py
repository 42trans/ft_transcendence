from django.contrib.auth import get_user_model, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.messages import get_messages
from django.urls import reverse, resolve
from django.test import TestCase
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


class AccessEnable2FaNotLoginUserTests(TestCase):
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


class AccessVerify2FaNotLoginUserTests(TestCase):
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
