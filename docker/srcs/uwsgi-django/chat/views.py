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
    message_log = Message.objects.filter(
        sender__in=[user, other_user],
        receiver__in=[user, other_user]
    ).order_by('timestamp')

    data = {
        'nickname': other_user.nickname,
        'messages': message_log
    }
    return render(request, 'chat/dm.html', data)


class DMListAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        sessions = DMSession.objects.filter(member=user)
        other_user_list = []
        for session in sessions:
            other_users = session.member.exclude(id=user.id)
            for other_user in other_users:
                other_user_list.append({
                    'id': other_user.id,
                    'nickname': other_user.nickname,
                    'session_id': session.sessionId
                })

        unique_partners = {other['id']: other for other in other_user_list}.values()
        return JsonResponse(list(unique_partners), safe=False, status=200)


class MessagesAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs) -> JsonResponse:
        nickname = request.data.get('nickname')

        dm_session = DMSession.objects.get(member__nickname=nickname)
        messages = Message.objects.filter(session=dm_session)
        params = {
            'nickname': nickname,
            'sessionId': dm_session.id,
            'messages': [{'sender': msg.sender.nickname, 'message': msg.message} for msg in messages]
        }
        return JsonResponse(params, status=200)


# test page
def test(request):
    return render(request, "chat/tmp.html")


# test page
def dm_list(request):
    return render(request, "chat/dm_list.html")
