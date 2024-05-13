# chat/systen_message.py
import json
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response

from asgiref.sync import async_to_sync, sync_to_async
from channels.layers import get_channel_layer

from accounts.models import CustomUser
from chat.models import DMSession, Message
from chat.dm_consumers import DMConsumer
from channels.db import database_sync_to_async

import logging


logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)
logger = logging.getLogger('chat')


class SystemMessageAPI(APIView):
    permission_classes = [IsAuthenticated]  # login required
    # permission_classes = [AllowAny]

    def post(self, request) -> Response:
        """
        request body
         target_nickname: the nickname of the target user for send system message
         message: system message
        """
        # logger.debug(f'[system message] 1')
        target_nickname = request.data.get('target_nickname')
        message = request.data.get('message')

        if not message or not target_nickname:
            response = {
                'status': 'error',
                'message': 'Message and target nickname are required'
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        logger.debug(f'[system message] 2: target: {target_nickname}, message: {message}')

        try:
            target_user = CustomUser.objects.get(nickname=target_nickname)
            system_user = CustomUser.objects.get(is_system=True)  # システムユーザーを取得
            logger.debug(f'[system message] 3: system_user: {system_user.nickname}')

            if target_user == system_user:
                response = {
                    'status': 'error',
                    'message': 'Target user should be other than system user'
                }
                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            dm_session = DMSession.get_session(system_user.id,
                                               target_user.id,
                                               is_system_message=True)

            # メッセージをデータベースに保存
            message_instance = Message.objects.create(sender=system_user,
                                                      receiver=target_user,
                                                      message=message)
            timestamp = message_instance.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            logger.debug(f'[system message] 4, dm_session.id: {dm_session.id}')

            channel_layer = get_channel_layer()
            DMConsumer.send_system_message(channel_layer,
                                                 dm_session.id,
                                                 system_user.nickname,
                                                 message,
                                                 timestamp,
                                                 is_system_message=True)

            logger.debug(f'[system message] 5')
            response = {
                'status': 'success',
                'message': 'System message sent'
            }
            return Response(response, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            response = {
                'status': 'error',
                'message': 'Target user does not exist'
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.debug(f'[system message] 6: err {str(e)}')
            response = {
                'status': 'error',
                'message': f'Error: {str(e)}'
            }
            return Response(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
