# accounts/views/basic_auth.py

from django.views import View
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from accounts.forms import SignupForm, LoginForm

class SignupView(View):
    signup_url = "accounts/signup.html"
    pong_top_url = "/pong/"

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.pong_top_url)

        form = SignupForm()
        param = {'form': form}
        return render(request, self.signup_url, param)


    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.pong_top_url)

        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(to=self.pong_top_url)

        param = {'form': form}
        return render(request, self.signup_url, param)


class LoginView(View):
    login_url = "accounts/login.html"
    pong_top_url = "/pong/"

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.pong_top_url)

        form = LoginForm()
        param = {'form': form}
        return render(request, self.login_url, param)


    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.pong_top_url)

        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user:
                login(request, user)
                return redirect(to=self.pong_top_url)

        param = {'form': form}
        return render(request, self.login_url, param)


class LogoutView(View):
    logout_url = "accounts/logout.html"

    def get(self, request, *args, **kwargs):
        logout(request)
        return render(request, self.logout_url)
