from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm

CustomUser = get_user_model()

class SignupForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ['email', 'nickname', 'password1', 'password2']

class LoginForm(AuthenticationForm):
    pass


class UserEditForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['nickname']


class CustomPasswordChangeForm(PasswordChangeForm):
    pass
