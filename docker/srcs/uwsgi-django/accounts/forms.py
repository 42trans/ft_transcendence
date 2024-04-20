from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm
from django.core.exceptions import ValidationError
from django_otp.plugins.otp_totp.models import TOTPDevice

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


class Enable2FAForm(forms.Form):
    token = forms.CharField(label='2FA Token', max_length=6, required=True)

    def __init__(self, *args, **kwargs):
        self.totp = kwargs.pop('totp', None)
        super(Enable2FAForm, self).__init__(*args, **kwargs)

    def clean_token(self):
        token = self.cleaned_data['token']
        if self.totp is None or not self.totp.verify(token):
            raise ValidationError('Invalid token')
        return token


# todo: JWT認証への切り替えで不要に。testなどの呼び出しを変更後、削除予定
class Verify2FAForm(forms.Form):
    token = forms.CharField(label='2FA Token', max_length=6, required=True)

    def __init__(self, *args, **kwargs):
        self.devices = kwargs.pop('devices', [])
        super().__init__(*args, **kwargs)

    def clean_token(self):
        token = self.cleaned_data.get('token')
        valid_token = any(device.verify_token(token) for device in self.devices)
        if not valid_token:
            raise ValidationError('Invalid token')
        return token
