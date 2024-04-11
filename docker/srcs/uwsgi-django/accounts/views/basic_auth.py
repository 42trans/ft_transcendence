# accounts/views/basic_auth.py

from django.contrib.auth import login, logout
from django.views import View
from django.shortcuts import render, redirect
from django_otp.plugins.otp_totp.models import TOTPDevice

from accounts.forms import SignupForm, LoginForm
from accounts.views.jwt import response_with_jwt


class SignupView(View):
    signup_url = "accounts/signup.html"
    authenticated_redirect_to = "/pong/"

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.authenticated_redirect_to)

        form = SignupForm()
        param = {'form': form}
        return render(request, self.signup_url, param)


    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.authenticated_redirect_to)

        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(to=self.authenticated_redirect_to)

        param = {'form': form}
        return render(request, self.signup_url, param)


class LoginView(View):
    login_url = "accounts/login.html"
    authenticated_redirect_to = "/pong/"

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.authenticated_redirect_to)

        form = LoginForm()
        param = {
            'form': form
        }
        return render(request, self.login_url, param)


    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.authenticated_redirect_to)

        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user:
                if user.enable_2fa:
                    request.session['temp_auth_user_id'] = user.id  # 一時的な認証情報をセッションに保存
                    return redirect(to='accounts:verify_2fa')  # OTP検証ページへリダイレクト
                else:
                    login(request, user)  # 2FAが無効ならば、通常通りログイン
                    return response_with_jwt(user, self.authenticated_redirect_to)

        param = {
            'form': form
        }
        return render(request, self.login_url, param)


class LogoutView(View):
    logout_url = "accounts/logout.html"

    def get(self, request, *args, **kwargs):
        logout(request)
        return render(request, self.logout_url)
