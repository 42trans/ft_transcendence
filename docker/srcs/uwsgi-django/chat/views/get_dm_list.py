# chat/views/dm_list.py

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


class GetDMList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        sessions = DMSession.objects.filter(member=user)
        other_user_list = []
        for session in sessions:
            other_users = session.member.exclude(id=user.id)
            for other_user in other_users:
                message_data = {
                    'user_id': other_user.id,
                    'nickname': other_user.nickname,
                    'session_id': session.sessionId,
                    'is_system_message': session.is_system_message
                }
                other_user_list.append(message_data)

        unique_partners = {message['user_id']: message for message in other_user_list}.values()
        return JsonResponse(list(unique_partners), safe=False, status=200)
