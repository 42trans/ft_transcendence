# chat/views/dm_sessions.py

from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.models import CustomUser
from chat.models import DMSession


class GetDMSessionsAPI(APIView):
    """
    Login userが参加しているDMSession一覧を取得
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs) -> Response:
        user = request.user

        sessions = DMSession.objects.filter(member=user)
        dm_set = set()

        for session in sessions:
            other_user = session.member.exclude(id=user.id).first()
            if other_user:
                dm_set.add((other_user.nickname, session.is_system_message))

        dm_sessions = []
        for nickname_dm_with, is_system_message in dm_set:
            data = {
                'nickname': nickname_dm_with,
                'is_system_message': is_system_message  # Maybe unused
            }
            dm_sessions.append(data)

        return Response(dm_sessions, status=status.HTTP_200_OK)
