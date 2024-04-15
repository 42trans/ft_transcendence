from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse, resolve
from django.test import TestCase

from accounts.forms import SignupForm
from accounts.views.basic_auth import SignupView


class SignUpFormTests(TestCase):
    kSignUpName = "accounts:signup"
    kSignUpURL = "/accounts/signup/"

    def setUp(self):
        url = reverse(self.kSignUpName)
        self.response = self.client.get(url)

    def test_signup_status_code(self):
        self.assertEqual(self.response.status_code, 200)

    def test_signup_url_resolves_signup_view(self):
        view = resolve(self.kSignUpURL)
        self.assertEqual(view.func.view_class, SignupView)

    def test_csrf(self):
        self.assertContains(self.response, 'csrfmiddlewaretoken')

    def test_contains_form(self):
        form = self.response.context.get('form')
        self.assertIsInstance(form, SignupForm)

    def test_form_inputs(self):
        '''
        The sign-up form contain 5 <input> tags:
         (csrf), email, nickname, password1, password2
        '''
        self.assertContains(self.response, '<input', 5)
        self.assertContains(self.response, 'type="hidden"', 1)      # csrf
        self.assertContains(self.response, 'type="email"', 1)       # email
        self.assertContains(self.response, 'type="text"', 1)        # nickname
        self.assertContains(self.response, 'type="password"', 2)    # password


class SignUpSuccessTests(TestCase):
    kSignUpName = "accounts:signup"
    kSignUpURL = "/accounts/signup/"
    kHomeURL = "/pong/"

    def setUp(self):
        url = reverse(self.kSignUpName)
        user_field = {
            'email': 'test@signup.com',
            'nickname': 'test',
            'password1': 'pass0123',
            'password2': 'pass0123'
        }
        self.response = self.client.post(url, user_field)
        self.home_url = self.kHomeURL

    def test_redirection(self):
        self.assertRedirects(self.response, self.home_url)

    def test_user_creation(self):
        user = get_user_model()
        self.assertTrue(user.objects.exists())

    def test_user_authentication(self):
        response = self.client.get(self.home_url)
        user = response.context.get('user')
        self.assertTrue(user.is_authenticated)



class SignUpFailureTests(TestCase):
    kSignUpName = "accounts:signup"

    def setUp(self):
        url = reverse(self.kSignUpName)
        user_field = {}
        self.response = self.client.post(url, user_field)
        self.response = self.client.post(url, {})

    def test_signup_status_code(self):
        self.assertEqual(self.response.status_code, 200)

    def test_form_errors(self):
        form = self.response.context.get('form')
        self.assertTrue(form.errors)

    def test_dont_create_user(self):
        user = get_user_model()
        self.assertFalse(user.objects.exists())
