# accounts/views/user.py

import logging
import requests

from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpRequest, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse_lazy, reverse
from django.views import View
from django.views.generic import TemplateView
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.forms import UserEditForm, CustomPasswordChangeForm
from accounts.models import CustomUser, UserManager, Friend
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

    def get(self, request) -> JsonResponse:
        user = request.user
        params = {
            'email': user.email,
            'nickname': user.nickname,
            'enable_2fa': user.enable_2fa,
        }
        return JsonResponse(params)


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


# todo: tmp, API and FBV -> CBV
def get_user_info(request, nickname):
    if not nickname:
        return redirect('/pong/')

    try:
        user = request.user
        if not user.is_authenticated:
            return redirect(to='/pong/')

        info_user = CustomUser.objects.get(nickname=nickname)
        is_blocking_user = request.user.blocking_users.filter(id=info_user.id).exists()


        # フレンドリクエスト送信済みの情報（pendingのみ）
        friend_request_sent = Friend.objects.filter(sender=user, receiver=info_user, status='pending').first()
        # フレンドリクエスト受信済みの情報（pendingのみ）
        friend_request_received = Friend.objects.filter(sender=info_user, receiver=user, status='pending').first()
        # 既に友達であるか確認
        is_friend = Friend.objects.filter(sender=user, receiver=info_user, status='accepted').exists() or \
                    Friend.objects.filter(sender=info_user, receiver=user, status='accepted').exists()

        user_data = {
            'info_user_id'      : info_user.id,
            'info_user_email'   : info_user.email,
            'info_user_nickname': info_user.nickname,
            'enable_2fa'        : info_user.enable_2fa,
            'isBlockingUser'    : is_blocking_user,
            'is_friend'         : is_friend,
            'friend_request_sent_status'    : 'pending' if friend_request_sent else None,
            'friend_request_received_status': 'pending' if friend_request_received else None,
        }
        return render(request, 'accounts/user_info.html', {'user_data': user_data})

    except Exception as e:
        logging.error(f"API request failed: {e}")
        return redirect('/pong/')
