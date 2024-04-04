from django.shortcuts import render, redirect
from .forms import SignupForm, LoginForm
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from .models import CustomUser


def signup_view(request):
    if request.user.is_authenticated:
        return redirect('/pong/')  # ログイン済みの場合は/pong/にリダイレクト

    if request.method == 'POST':

        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(to='/pong/')
    else:
        form = SignupForm()

    param = {
        'form': form
    }

    return render(request, 'accounts/signup.html', param)


def login_view(request):
    if request.user.is_authenticated:
        return redirect('/pong/')  # ログイン済みの場合は/pong/にリダイレクト

    if request.method == 'POST':
        # next = request.POST.get('next')
        form = LoginForm(request, data=request.POST)

        if form.is_valid():
            user = form.get_user()

            if user:
                login(request, user)
                return redirect(to='/pong/')
    else:
        form = LoginForm()

    param = {
        'form': form,
    }

    return render(request, 'accounts/login.html', param)


def logout_view(request):
    logout(request)

    return render(request, 'accounts/logout.html')


@login_required
def user_view(request):
    user = request.user

    params = {
        'email': user.email,
        'nickname': user.nickname,
    }

    return render(request, 'accounts/user.html', params)
