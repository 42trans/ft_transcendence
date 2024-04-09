from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.urls import reverse, resolve
from django.test import TestCase
from accounts.forms import SignupForm
from accounts.views.basic_auth import LoginView


class LoginFormTests(TestCase):
    kLoginName = "accounts:login"
    kLoginURL = "/accounts/login/"

    def setUp(self):
        url = reverse(self.kLoginName)
        self.response = self.client.get(url)

    def test_login_status_code(self):
        self.assertEqual(self.response.status_code, 200)

    def test_login_url_resolves_login_view(self):
        view = resolve(self.kLoginURL)
        self.assertEqual(view.func.view_class, LoginView)

    def test_csrf(self):
        self.assertContains(self.response, 'csrfmiddlewaretoken')

    def test_contains_form(self):
        form = self.response.context.get('form')
        self.assertIsInstance(form, AuthenticationForm)

    def test_form_inputs(self):
        '''
        The login form should contain 3 <input> tags:
         (csrf, next), email, password
        '''
        self.assertContains(self.response, '<input', 4)
        self.assertContains(self.response, 'type="hidden"', 2)      # csrf, next
        self.assertContains(self.response, 'type="text"', 1)        # username->email
        self.assertContains(self.response, 'type="password"', 1)    # password


class LoginSuccessTests(TestCase):
    kLoginName = "accounts:login"
    kHomeURL = "/pong/"

    kUserEmail = 'test@example.com'
    kUserNickname = 'test'
    kUserPassword = 'pass012345'


    def setUp(self):
        self.user = get_user_model().objects.create_user(email=self.kUserEmail,
                                                         nickname=self.kUserNickname,
                                                         password=self.kUserPassword)
        self.user.save()
        url = reverse(self.kLoginName)
        user_field = {
            'username'  : self.kUserEmail,  # email is entered in the username field of the form
            'password'  : self.kUserPassword,
        }
        self.response = self.client.post(url, user_field)
        self.home_url = self.kHomeURL

    def test_redirection(self):
        self.assertRedirects(self.response, self.home_url)

    def test_user_authentication(self):
        response = self.client.get(self.home_url)
        user = response.context.get('user')
        self.assertTrue(user.is_authenticated)


class LoginFailureTests(TestCase):
    kLoginName = "accounts:login"
    kUserPassword = 'pass012345'

    def setUp(self):
        url = reverse(self.kLoginName)
        user_field = {
            'username'  : 'wrong@email.com',  # email is entered in the username field of the form
            'password'  : self.kUserPassword,
        }
        self.response = self.client.post(url, user_field)

    def test_login_status_code(self):
        self.assertEqual(self.response.status_code, 200)

    def test_form_errors(self):
        form = self.response.context.get('form')
        self.assertTrue(form.errors)

    def test_user_not_authenticated(self):
        response = self.client.get(reverse('accounts:login'))
        user = response.context.get('user')
        self.assertFalse(user.is_authenticated)
