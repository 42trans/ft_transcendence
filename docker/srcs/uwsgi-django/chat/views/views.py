# chat/views.py

import logging
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import models
from django.shortcuts import render, redirect
from django.views.generic import TemplateView
from rest_framework.permissions import AllowAny, IsAuthenticated

from accounts.models import CustomUser
from chat.models import DMSession, Message

logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)

logger = logging.getLogger(__name__)


class DMView(LoginRequiredMixin, TemplateView):
    """
    DM相手のnicknameを受取り、chat/dm-with/<str:nickname> をレンダリング
    nicknameが存在しないuserなどの不正値出会った場合は、chat:dm_sessions へ遷移
    Login認証していなければ accounts:login へ遷移
    """
    template_name = "chat/dm.html"
    error_occurred_redirect_to = "chat:dm_sessions"

    def get(self, request, target_nickname):
        # user, other_userを取得
        # dm targetのnicknameがuser.nicknameである場合はerr
        user, other_user, err = self._get_dm_users(request, target_nickname)
        if err is not None:
            messages.error(request, err)
            return redirect(self.error_occurred_redirect_to)

        # DBから user, other_userのメッセージを取得。検索パターンは
        #  1) sender=user,       receiver=other_user
        #  2) sender=other_user, receiver=user
        message_log = Message.objects.filter(
            (models.Q(sender=user) & models.Q(receiver=other_user)) |
            (models.Q(sender=other_user) & models.Q(receiver=user))
        ).order_by('timestamp')
        is_blocking_user = user.blocking_users.filter(id=other_user.id).exists()

        # dm.htmlのレンダリングに必要な情報を格納
        data = {
            'target_nickname'   : other_user.nickname,
            'messages'          : message_log,
            'isBlockingUser'    : is_blocking_user,
            'isSystemUser'      : other_user.is_system
        }
        # logging.error(f'dm_room: user: {user.nickname}, dm_to: {nickname}, blocking: {is_blocking_user}')
        return render(request, self.template_name, data)


    def _get_dm_users(self, request, target_nickname):
        try:
            user = request.user
            other_user = CustomUser.objects.get(nickname=target_nickname)
            err = None

            if target_nickname == user.nickname:
                err = "You cannot send a message to yourself"
            return user, other_user, err

        except CustomUser.DoesNotExist:
            err = "The specified user does not exist"
        except Exception as e:
            err = str(e)
        return None, None, err


class DMSessionsView(LoginRequiredMixin, TemplateView):
    template_name = "chat/dm_sessions.html"

    def get(self, request):
        return render(request, self.template_name)
