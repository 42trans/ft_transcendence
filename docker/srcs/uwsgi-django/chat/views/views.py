# chat/views.py

import logging
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import models
from django.shortcuts import render, redirect
from django.templatetags.static import static
from django.views.generic import TemplateView

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser
from chat.models import DMSession, Message

logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)

logger = logging.getLogger(__name__)


def _get_dm_users(request, target):
    try:
        if not target:
            err = "Nickname cannot be empty"
            return None, None, err

        user = request.user
        dm_target = None
        err = None

        if isinstance(target, int):
            # targetがintの場合は、idとみなして検索
            dm_target = CustomUser.objects.get(id=target)
        elif isinstance(target, str):
            # targetがstrの場合は、nicknameとみなして検索
            dm_target = CustomUser.objects.get(nickname=target)
        else:
            err = "Invalid target type"
            return None, None, err

        if dm_target == user:
            err = "You cannot send a message to yourself"
        return user, dm_target, err

    except CustomUser.DoesNotExist:
        err = "The specified user does not exist"
    except Exception as e:
        err = str(e)
    return None, None, err


class ValidateDmTargetAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, target_nickname: str) -> Response:
        user, dm_target, err = _get_dm_users(request, target_nickname)
        logger.error(f"ValidateDmTargetAPI target: {target_nickname}")
        if err is not None:
            logger.error(f"ValidateDmTargetAPI error: {err}")
            return Response({'error': err}, status=400)
        return Response({'status': 'ok', 'target_id': dm_target.id}, status=200)


class DMView(LoginRequiredMixin, TemplateView):
    """
    DM相手のnicknameを受取り、chat/dm-with/<str:nickname> をレンダリング
    nicknameが存在しないuserなどの不正値出会った場合は、chat:dm_sessions へ遷移
    Login認証していなければ accounts:login へ遷移
    """
    template_name = "chat/dm_with.html"
    error_occurred_redirect_to = "chat:dm_sessions"

    def get(self, request, target_id: str):
        # user, other_userを取得
        # dm targetのnicknameがuser.nicknameである場合はerr
        user, dm_target, err = _get_dm_users(request, target_id)
        if err is not None:
            # messages.error(request, err)
            return redirect(self.error_occurred_redirect_to)  # ValidateDmTargetAPIで判定済み

        # DBから user, other_userのメッセージを取得。検索パターンは
        #  1) sender=user,       receiver=dm_target
        #  2) sender=dm_target,  receiver=user
        message_log = Message.objects.filter(
            (models.Q(sender=user) & models.Q(receiver=dm_target)) |
            (models.Q(sender=dm_target) & models.Q(receiver=user))
        ).order_by('timestamp')

        is_blocking_user = user.blocking_users.filter(id=dm_target.id).exists()

        user_info = {
            'id'        : user.id,
            'nickname'  : user.nickname,
            'avatar_url': user.avatar.url,
        }
        target_info = {
            'id'                : dm_target.id,
            'nickname'          : dm_target.nickname,
            'avatar_url'        : dm_target.avatar.url,
            'isBlockingUser'    : is_blocking_user,
            'isSystemUser'      : dm_target.is_system,
        }
        # dm.htmlのレンダリングに必要な情報を格納
        data = {
            'user_info'         : user_info,
            'target_info'       : target_info,
            'message_log'       : message_log,
            'url_config'        : settings.URL_CONFIG,
        }
        # logging.error(f'dm_room: user: {user.nickname}, dm_to: {nickname}, blocking: {is_blocking_user}')
        return render(request, self.template_name, data)



class DMSessionsView(LoginRequiredMixin, TemplateView):
    template_name = "chat/dm_sessions.html"

    def get(self, request):
        return render(request, self.template_name)
