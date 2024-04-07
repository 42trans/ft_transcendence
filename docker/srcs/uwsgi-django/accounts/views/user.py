# accounts/views/user.py

import requests
import logging
from django.views import View
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from accounts.forms import UserEditForm, CustomPasswordChangeForm

logger = logging.getLogger(__name__)


class UserPageView(LoginRequiredMixin, View):
    """
    render user page
    user is not authenticated, redirect to LOGIN_URL written in setting.py
    """
    user_page_url = "accounts/user.html"

    def get(self, request, *args, **kwargs):
        user = request.user

        params = {
            'email': user.email,
            'nickname': user.nickname,
        }
        return render(request, self.user_page_url, params)



class EditUserProfileView(LoginRequiredMixin, View):
    """
    render edit user profile page
    user is not authenticated, redirect to LOGIN_URL written in setting.py
    """
    edit_url = "accounts/edit_profile.html"
    redirect_to = "accounts:edit"
    pong_top_url = "/pong/"

    def get(self, request, *args, **kwargs):
        user_form = UserEditForm(instance=request.user)

        if self._is_42auth_user(request):
            password_form = None
        else:
            password_form = CustomPasswordChangeForm(user=request.user)

        params = {
            'user_form': user_form,
            'password_form': password_form,
        }
        return render(request, self.edit_url, params)


    def post(self, request, *args, **kwargs):
        if self._is_42auth_user(request):
            password_form = None
            password_form_is_valid = False
        else:
            password_form = CustomPasswordChangeForm(user=request.user,
                                                     data=request.POST)
            password_form_is_valid = password_form.is_valid()

        old_nickname = request.user.nickname
        user_form = UserEditForm(request.POST, instance=request.user)
        if user_form.is_valid() and not password_form_is_valid:
            user = user_form.save(commit=False)
            new_nickname = user_form.cleaned_data.get('nickname')

            if old_nickname == new_nickname:
                messages.warning(request,
                                 'Your nickname has not changed')
            else:
                user.save()
                messages.success(request,
                                 f'Your nickname was successfully updated from "{old_nickname}" to "{new_nickname}"')
                return redirect(reverse_lazy(self.redirect_to))

        elif password_form_is_valid:
            user = password_form.save()
            update_session_auth_hash(request, user)
            messages.success(request, 'Your password was successfully updated!')
            return redirect(reverse_lazy(self.redirect_to))

        params = {
            'user_form': user_form,
            'password_form': password_form,
        }
        return render(request, self.edit_url, params)


    def _is_42auth_user(self, request) -> bool:
        return not request.user.has_usable_password()
