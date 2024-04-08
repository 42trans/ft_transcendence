from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm
from django.core.exceptions import ValidationError
from accounts.models import CustomUser, UserManager

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

    def clean_nickname(self):
        nickname = self.cleaned_data['nickname']
        is_valid, error_message = UserManager._is_valid_nickname(nickname)
        if not is_valid:
            raise ValidationError(error_message)
        return nickname


class CustomPasswordChangeForm(PasswordChangeForm):
    def clean_new_password1(self):
        old_password = self.cleaned_data.get('old_password')
        new_password1 = self.cleaned_data.get('new_password1')
        if old_password and new_password1:
            if old_password == new_password1:
                raise ValidationError("The new password cannot be the same as your current password.")

        tmp_user = self.user
        is_valid, error_message = UserManager._is_valid_password(new_password1, tmp_user)
        if not is_valid:
            raise ValidationError(error_message)

        return new_password1
