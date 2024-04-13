# accounts/views/user.py

import logging
import requests

from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpRequest
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views import View
from django.views.generic import TemplateView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.forms import UserEditForm, CustomPasswordChangeForm
from accounts.models import CustomUser, UserManager
from accounts.views.jwt import is_valid_jwt


logger = logging.getLogger(__name__)


class UserProfileView(TemplateView):
    template_name = "accounts/user.html"

    def get(self, request, *args, **kwargs):
        if not is_valid_jwt(request):
            return redirect('accounts:login')

        return super().get(request, *args, **kwargs)


class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        params = {
            'email': user.email,
            'nickname': user.nickname,
            'enable_2fa': user.enable_2fa,
        }
        return Response(params)


class EditUserProfileTemplateView(TemplateView):
    template_name = "accounts/edit_profile.html"

    def get(self, request, *args, **kwargs):
        if not is_valid_jwt(request):
            return redirect('accounts:login')

        return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        current_user = self.request.user
        context['current_nickname'] = current_user.nickname if current_user.is_authenticated else 'current-nickname'
        context['is_42auth_user'] = self._is_42auth_user(self.request)
        return context

    def _is_42auth_user(self, request: HttpRequest) -> bool:
        return not request.user.has_usable_password()


class EditUserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        new_nickname = request.data.get('nickname')
        new_password = request.data.get('new_password', None)
        input_current_password = request.data.get('current_password', None)

        if new_nickname is not None:
            is_ok, msg = self._update_nickname(request.user, new_nickname)
            if is_ok is False:
                data = {'error': msg}
                return Response(data, status=400)

            data = {'message': msg}
            return Response(data, status=200)

        if input_current_password is not None and new_password is not None:
            is_ok, msg = self._update_password(request, input_current_password, new_password)
            if is_ok is False:
                data = {'error': msg}
                return Response(data, status=400)

            data = {'message': msg}
            return Response(data, status=200)

        data = {'error': 'Update profile error'}
        return Response(data, status=400)

    def _update_nickname(self, user, new_nickname):

        old_nickname = user.nickname
        if old_nickname == new_nickname:
            msg = "new nickname same as current"
            return False, msg

        is_ok, err = UserManager._is_valid_nickname(new_nickname)
        if is_ok is False:
            return False, err


        user.nickname = new_nickname
        user.save()
        return True, f"nickname updat successfully {old_nickname} -> {new_nickname}"


    def _update_password(self, request, input_current_password, new_password):
        user = request.user
        if not check_password(input_current_password, user.password):
            return False, "Current password is incorrect"

        if input_current_password == new_password:
            return False, "new password same as current"

        tmp_user = CustomUser(email=user.email, nickname=user.nickname)
        is_ok, msg = UserManager._is_valid_password(new_password, tmp_user)
        if is_ok is False:
            return False, msg

        user.set_password(new_password)
        update_session_auth_hash(request, user)  # password更新によるsessionを継続
        user.save()
        return True, "password updat successfully"




# todo: rm
class EditUserProfileView(LoginRequiredMixin, View):
    """
    render edit user profile page
    user is not authenticated, redirect to LOGIN_URL written in setting.py
    """
    edit_url = "accounts/edit_profile.html"
    redirect_to = "accounts:edit"

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


    def _is_42auth_user(self, request: HttpRequest) -> bool:
        return not request.user.has_usable_password()
