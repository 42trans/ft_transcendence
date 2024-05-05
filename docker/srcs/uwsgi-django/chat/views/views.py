# chat/views.py

import logging
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import TemplateView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView

from accounts.models import CustomUser
from chat.models import DMSession, Message


logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)

logger = logging.getLogger(__name__)


class DMView(TemplateView):
    template_name = "chat/dm.html"
    error_occurred_redirect_to = "chat:dm_sessions"
    not_authenticated_redirect_to = "accounts:login"

    def get(self, request, nickname):
        if not request.user.is_authenticated:
            return redirect(self.not_authenticated_redirect_to)

        user = request.user
        if nickname == user.nickname:
            messages.error(request, "You cannot send a message to yourself")
            return redirect(self.error_occurred_redirect_to)

        try:
            target_user = CustomUser.objects.get(nickname=nickname)
        except CustomUser.DoesNotExist:
            messages.error(request, "The specified user does not exist")
            return redirect(self.error_occurred_redirect_to)

        # DMからログを取得
        other_user = CustomUser.objects.get(id=target_user.id)
        message_log = Message.objects.filter(
            sender__in=[user, other_user],
            receiver__in=[user, other_user]
        ).order_by('timestamp')

        is_blocking_user = user.blocking_users.filter(id=target_user.id).exists()

        data = {
            'nickname'      : other_user.nickname,
            'messages'      : message_log,
            'isBlockingUser': is_blocking_user,
            'isSystemUser'  : other_user.is_system
        }
        # logging.error(f'dm_room: user: {user.nickname}, dm_to: {nickname}, blocking: {is_blocking_user}')
        return render(request, self.template_name, data)



class DMSessionsView(TemplateView):
    template_name = "chat/dm_sessions.html"
    not_authenticated_redirect_to = "accounts:login"

    def get(self, request):
        if not request.user.is_authenticated:
            return redirect(self.not_authenticated_redirect_to)

        return render(request, self.template_name)
