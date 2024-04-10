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
    device_name = forms.CharField(label='Device Name', max_length=16, required=True)

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super(Enable2FAForm, self).__init__(*args, **kwargs)

    def clean(self):
        # 2FAを有効化するための特定の検証が必要な場合に実装
        # 例: ユーザーが既に2FAを有効にしていないことを確認する
        if TOTPDevice.objects.filter(user=self.user, confirmed=True).exists():
            raise forms.ValidationError("2FA is already enabled for this user.")

        return super(Enable2FAForm, self).clean()

    def save(self):
        # 2FAデバイスの作成と有効化のロジックを実装します。
        # 実際には、`enable_2fa`ビューでこの処理を行っているため、
        # このメソッドはカスタマイズによって異なる処理を含むかもしれません。
        pass


class Verify2FAForm(forms.Form):
    token = forms.CharField(label='2FA Token', max_length=6)
