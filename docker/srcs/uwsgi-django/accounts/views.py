from django.shortcuts import render, redirect
from .forms import SignupForm, LoginForm, UserEditForm, CustomPasswordChangeForm
from django.contrib import messages
from django.contrib.auth import login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from .models import CustomUser

from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model


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


@login_required
def edit_profile(request):
    if request.method == 'POST':
        user_form = UserEditForm(request.POST, instance=request.user)
        password_form = CustomPasswordChangeForm(user=request.user, data=request.POST)

        if user_form.is_valid() and not password_form.is_valid():
            user_form.save()
            messages.success(request, 'Your profile was successfully updated!')
            return redirect(reverse_lazy('edit'))

        elif password_form.is_valid():
            user = password_form.save()
            update_session_auth_hash(request, user)  # Important!
            messages.success(request, 'Your password was successfully updated!')
            return redirect(reverse_lazy('edit'))

    else:
        user_form = UserEditForm(instance=request.user)
        password_form = CustomPasswordChangeForm(user=request.user)

    params = {
        'user_form': user_form,
        'password_form': password_form,
    }

    return render(request, 'accounts/edit_profile.html', params)
