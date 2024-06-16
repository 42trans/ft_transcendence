# chat/views/dm_sessions.py

from django.contrib import messages
from django.shortcuts import render, redirect
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from chat.models import DMSession


class GetDMSessionsAPI(APIView):
    """
    Login userが参加しているDMSession一覧を取得
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs) -> Response:
        dm_sessions = self._get_dm_session(request)
        dm_session_list = self._get_dm_session_list(dm_sessions)
        return Response(dm_session_list, status=status.HTTP_200_OK)


    def _get_dm_session(self, request):
        user = request.user
        sessions = DMSession.objects.filter(member=user)
        dm_set = set()
        for session in sessions:
            other_user = session.member.exclude(id=user.id).first()
            if other_user:
                dm_set.add((other_user.nickname, other_user.id, session.is_system_message))
        return dm_set


    def _get_dm_session_list(self, dm_set):
        dm_session_list = []
        for target_nickname, target_id, is_system_message in dm_set:
            data = {
                'target_nickname'   : target_nickname,
                'target_id'         : target_id,
                'is_system_message' : is_system_message  # Maybe unused
            }
            dm_session_list.append(data)
        sorted_dm_session_list = sorted(dm_session_list, key=lambda x: x['target_nickname'])
        return sorted_dm_session_list
