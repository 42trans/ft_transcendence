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


class SendMessage(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs) -> JsonResponse:
        nickname = request.data.get('nickname')

        dm_session = DMSession.objects.get(member__nickname=nickname)
        messages = Message.objects.filter(session=dm_session)
        message_list = [{'sender': msg.sender.nickname, 'message': msg.message} for msg in messages]
        params = {
            'nickname': nickname,
            'sessionId': dm_session.id,
            'messages': message_list
        }
        return JsonResponse(params, status=200)
