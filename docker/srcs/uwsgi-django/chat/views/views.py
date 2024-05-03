# chat/views.py

from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.models import CustomUser
from chat.models import DMSession, Message

import logging


logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)
logger = logging.getLogger(__name__)


def print_blue(text):
    print(f"\033[34m[DEBUG] {text}\033[0m")


def index(request):
    if not request.user.is_authenticated:
        return redirect("accounts:login")

    user = request.user
    data = {
        'nickname': user.nickname
    }
    return render(request, "chat/index.html", data)


def chat_room(request, room_name):
    if not request.user.is_authenticated:
        return redirect("accounts:login")

    data = {
        "room_name": room_name
    }
    return render(request, "chat/room.html", data)


# todo: CBV API
def dm_room(request, nickname):
    if not request.user.is_authenticated:
        return redirect("accounts:login")

    user = request.user
    if nickname == user.nickname:
        messages.error(request, "You cannot send a message to yourself")
        return redirect('chat:index')

    try:
        target_user = CustomUser.objects.get(nickname=nickname)
    except CustomUser.DoesNotExist:
        messages.error(request, "The specified user does not exist")
        return redirect('chat:index')

    # DMからログを取得
    other_user = CustomUser.objects.get(id=target_user.id)
    message_log = Message.objects.filter(
        sender__in=[user, other_user],
        receiver__in=[user, other_user]
    ).order_by('timestamp')

    is_blocking_user = user.blocking_users.filter(id=target_user.id).exists()

    data = {
        'nickname': other_user.nickname,
        'messages': message_log,
        'isBlockingUser': is_blocking_user,
        'isSystemUser': other_user.is_system
    }
    logging.error(f'dm_room: user: {user.nickname}, dm_to: {nickname}, blocking: {is_blocking_user}')
    return render(request, 'chat/dm.html', data)


# test page
def test(request):
    return render(request, "chat/tmp.html")


# test page
def dm_list(request):
    return render(request, "chat/dm_list.html")
