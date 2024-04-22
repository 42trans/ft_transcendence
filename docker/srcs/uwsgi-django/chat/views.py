# chat/views.py

from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render, redirect

from accounts.models import CustomUser


def index(request):
    if not request.user.is_authenticated:
        return redirect("accounts:login")

    user = request.user
    data = {
        'nickname': user.nickname
    }
    return render(request, "chat/index.html", data)


def room(request, room_name):
    if not request.user.is_authenticated:
        return redirect("accounts:login")

    data = {
        "room_name": room_name
    }
    return render(request, "chat/room.html", data)


def dm_view(request, nickname):
    print(f'dm_view 1')
    if not request.user.is_authenticated:
        return redirect("accounts:login")

    user = request.user
    user_nickname = user.nickname
    print(f'dm_view 2 user: {user_nickname}')

    if nickname == user_nickname:
        messages.error(request, "You cannot send a message to yourself.")
        return redirect('chat:index')

    print(f'dm_view 3')

    try:
        target_user = CustomUser.objects.get(nickname=nickname)
    except CustomUser.DoesNotExist:
        messages.error(request, "The specified user does not exist.")
        return redirect('chat:index')

    print(f'dm_view 4 dm_from: {user_nickname}, dm_to: {nickname}')
    data = {
        'dm_from'   : user_nickname,
        'nickname'  : nickname
    }
    return render(request, 'chat/dm.html', data)
