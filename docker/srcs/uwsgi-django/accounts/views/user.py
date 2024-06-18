# accounts/views/user.py

import os
import logging
import requests
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ValidationError
from django.core.files.storage import FileSystemStorage
from django.templatetags.static import static
from django.http import HttpRequest, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse_lazy, reverse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.forms import UserEditForm, CustomPasswordChangeForm
from accounts.models import CustomUser, UserManager, Friend

from pong.models import Tournament


logger = logging.getLogger(__name__)


class UserProfileView(LoginRequiredMixin, TemplateView):
    template_name = "accounts/user.html"

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request) -> JsonResponse:
        user = request.user
        # logger.debug(f'UserProfileAPIView: avatar_url: {user.avatar.url}')

        params = {
            'id'        : user.id,
            'email'     : user.email,
            'nickname'  : user.nickname,
            'enable_2fa': user.enable_2fa,
            'avatar_url': user.avatar.url,
        }
        return JsonResponse(params)


class EditUserProfileTemplateView(LoginRequiredMixin, TemplateView):
    template_name = "accounts/edit_profile.html"

    def get(self, request, *args, **kwargs):
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
        if self._is_progress_tournament_organizer(user):
            msg = "cannot change nickname while organizing an ongoing tournament"
            return False, msg

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

    def _is_progress_tournament_organizer(self, user):
        """
        進行中のtournament organizerの場合は、終了するまでnickname変更不可
        """
        return Tournament.objects.filter(organizer=user, is_finished=False).exists()


# todo: tmp, API and FBV -> CBV
def get_user_info(request, user_id):
    if not user_id:
        return redirect('/accounts/login/')

    try:
        user = request.user
        if not user.is_authenticated:
            return redirect(to='/accounts/login/')

        info_user = CustomUser.objects.get(id=user_id)
        avatar_url = info_user.avatar.url
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
            'avatar_url'        : avatar_url,
            'isBlockingUser'    : is_blocking_user,
            'is_friend'         : is_friend,
            'friend_request_sent_status'    : 'pending' if friend_request_sent else None,
            'friend_request_received_status': 'pending' if friend_request_received else None,
        }
        context = {
            'url_config': settings.URL_CONFIG,
            'user_data' : user_data,
        }
        return render(request, 'accounts/user_info.html', context)

    except Exception as e:
        logging.error(f"API request failed: {e}")
        return redirect('/accounts/login/')


class ChangeAvatarView(LoginRequiredMixin, TemplateView):
    template_name = 'accounts/change_avatar.html'
    login_url = reverse_lazy('accounts:login')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


class UploadAvatarAPI(APIView):
    permission_classes = [IsAuthenticated]
    redirect_to = "/accounts/user/"

    def post(self, request) -> Response:
        avatar_file = request.FILES.get('avatar')
        logger.debug(f'upload avatar 1')
        if not avatar_file:
            response = {
                'status': 'error',
                'message': 'No file provided'
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        try:
            logger.debug(f'upload avatar 2')
            self.__validate_avatar_extension(avatar_file)
            self.__validate_avatar_size(avatar_file)
            logger.debug(f'upload avatar 3')

            request.user.avatar.save(avatar_file.name, avatar_file, save=True)
            logger.debug(f'change_avatar: avatar_url: {request.user.avatar.url}')

            response = {
                'status': "success",
                'message': "upload successfully",
            }
            return Response(response, status=status.HTTP_200_OK)

        except ValidationError as e:
            logger.debug(f'upload avatar 4, error: {str(e)}')
            response = {
                'status': "error",
                'message': f"upload failed: {str(e)}",
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.debug(f'upload avatar 5, error: {str(e)}')
            response = {
                'status': "error",
                'message': f"unexpected error {str(e)}",
            }
            return Response(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # アバター画像ファイルのサイズバリデータ
    def __validate_avatar_size(self, avatar_file: str):
        if avatar_file is None:
            raise ValidationError("No file was uploaded. Please upload a file.")

        kMaxSizeKB = 500  # 最大サイズを500KBとする
        if kMaxSizeKB * 1024 < avatar_file.size:
            raise ValidationError(f'File too large. Size should not exceed {kMaxSizeKB} KB.')

    # アバター画像ファイルの拡張子バリデータ
    def __validate_avatar_extension(self, avatar_file: str):
        if avatar_file is None:
            raise ValidationError("No file was uploaded. Please upload a file.")

        valid_extensions = ['jpg', 'jpeg', 'png', 'gif']
        ext = os.path.splitext(avatar_file.name)[1][1:].lower()
        if ext not in valid_extensions:
            raise ValidationError(f'Unsupported file extension {ext}.'
                                  f' Allowed types are: jpg, jpeg, png, gif.')


class GetUserHistoryTemplateView(LoginRequiredMixin, TemplateView):
    template_name = "accounts/game_history.html"

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        context['nickname'] = user.nickname
        return context
