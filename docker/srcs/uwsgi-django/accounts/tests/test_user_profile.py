from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.messages import get_messages
from django.urls import reverse, resolve
from django.test import TestCase
from accounts.forms import UserEditForm
from accounts.views.user import EditUserProfileView


class UserProfileEditFormTests(TestCase):
    kLoginName = "accounts:login"
    kLoginURL = "/accounts/login/"

    kEditName = "accounts:edit"
    kEditURL = "/accounts/edit/"
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
            'username'  : self.kUserEmail,
            'password'  : self.kUserPassword,
        }
        self.response = self.client.post(url, user_field)

        url = reverse(self.kEditName)
        self.response = self.client.get(url)


    def test_edit_status_code(self):
        self.assertEqual(self.response.status_code, 200)


    def test_edit_url_resolves_edit_view(self):
        view = resolve(self.kEditURL)
        self.assertEqual(view.func.view_class, EditUserProfileView)


    def test_csrf(self):
        self.assertContains(self.response, 'csrfmiddlewaretoken')


    def test_contains_form(self):
        form = self.response.context.get('form')
        self.assertIsInstance(form, UserEditForm)


    def test_form_inputs(self):
        '''
        The edit form should contain 5 <input> tags:
         (csrf), nickname, password
        '''
        self.assertContains(self.response, '<input', 6)
        self.assertContains(self.response, 'type="hidden"', 2)      # csrf
        self.assertContains(self.response, 'type="text"', 1)        # nickname
        self.assertContains(self.response, 'type="password"', 3)    # password


class UserProfileEditSuccessTests(TestCase):
    kLoginName = "accounts:login"
    kLoginURL = "/accounts/login/"

    kEditName = "accounts:edit"
    kEditURL = "/accounts/edit/"
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
            'username'  : self.kUserEmail,
            'password'  : self.kUserPassword,
        }
        self.response = self.client.post(url, user_field)

        url = reverse(self.kEditName)
        self.response = self.client.get(url)
        self.edit_url = reverse(self.kEditName)


    def test_edit_nickname(self):
        new_nickname = 'newnickname'
        param = {
            'nickname': new_nickname
        }
        response = self.client.post(self.edit_url, param, follow=True)
        self.user.refresh_from_db()

        self.assertEqual(self.user.nickname, new_nickname)
        messages = list(get_messages(response.wsgi_request))
        self.assertEqual(len(messages), 1)

        msg = f"Your nickname was successfully updated from \"{self.kUserNickname}\" to \"{new_nickname}\""
        self.assertIn(msg, str(messages[0]))


    def test_change_password(self):
        new_password = "new9876abcd"
        param = {
            'old_password'  : self.kUserPassword,
            'new_password1' : new_password,
            'new_password2' : new_password,
        }
        response = self.client.post(self.edit_url, param, follow=True)
        self.user.refresh_from_db()

        self.assertTrue(self.user.check_password(new_password))
        messages = list(get_messages(response.wsgi_request))
        self.assertEqual(len(messages), 1)
        self.assertIn('Your password was successfully updated!', str(messages[0]))


class UserProfileEditFailureTests(TestCase):
    kLoginName = "accounts:login"
    kLoginURL = "/accounts/login/"

    kEditName = "accounts:edit"
    kEditURL = "/accounts/edit/"
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
            'username'  : self.kUserEmail,
            'password'  : self.kUserPassword,
        }
        self.response = self.client.post(url, user_field)

        url = reverse(self.kEditName)
        self.response = self.client.get(url)
        self.edit_url = reverse(self.kEditName)


    def test_nickname_not_changed(self):
        param = {
            'nickname': self.kUserNickname
        }
        response = self.client.post(self.edit_url, param, follow=True)
        self.user.refresh_from_db()

        self.assertEqual(self.user.nickname, self.kUserNickname)
        messages = list(get_messages(response.wsgi_request))
        self.assertEqual(len(messages), 1)
        msg = f"Your nickname has not changed"
        self.assertIn(msg, str(messages[0]))


    def test_invalid_new_nickname(self):
        new_nickname = "*"
        param = {
            'nickname': new_nickname
        }
        response = self.client.post(self.edit_url, param, follow=True)
        self.user.refresh_from_db()
        self.assertEqual(self.user.nickname, self.kUserNickname)


    def test_wrong_old_password(self):
        wrong_password = "a"
        new_password = "new9876abcd"
        param = {
            'old_password'  : wrong_password,
            'new_password1' : new_password,
            'new_password2' : new_password,
        }
        response = self.client.post(self.edit_url, param, follow=True)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.kUserPassword))


    def test_invalid_new_password(self):
        new_password = "new"
        param = {
            'old_password'  : self.kUserPassword,
            'new_password1' : new_password,
            'new_password2' : new_password,
        }
        response = self.client.post(self.edit_url, param, follow=True)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.kUserPassword))
