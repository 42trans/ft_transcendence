# chat/views.py

from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render, redirect

from accounts.models import CustomUser
from chat.models import DMSession, Message


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


def dm_room(request, nickname):
    print(f'dm_view 1')
    if not request.user.is_authenticated:
        return redirect("accounts:login")

    user = request.user
    if nickname == user.nickname:
        messages.error(request, "You cannot send a message to yourself.")
        return redirect('chat:index')

    print(f'dm_view 3')

    try:
        target_user = CustomUser.objects.get(nickname=nickname)
    except CustomUser.DoesNotExist:
        messages.error(request, "The specified user does not exist.")
        return redirect('chat:index')

    # DMからログを取得
    other_user = CustomUser.objects.get(id=target_user.id)
    messages = Message.objects.filter(
        sender__in=[user, other_user],
        receiver__in=[user, other_user]
    ).order_by('timestamp')

    data = {
        'nickname': other_user.nickname,
        'messages': messages
    }
    return render(request, 'chat/dm.html', data)


def dm_list(request):
    user = request.user
    if not user.is_authenticated:
        return redirect('accounts:login')

    sessions = DMSession.objects.filter(member=user).prefetch_related('member')
    data = []
    for session in sessions:
        other_user = [member for member in session.member.all() if member != user]
        for other in other_user:
            data.append({
                'user_id': other.id,
                'nickname': other.username
            })

    return JsonResponse(data, safe=False)


def test(request):
    return render(request, "chat/tmp.html")
