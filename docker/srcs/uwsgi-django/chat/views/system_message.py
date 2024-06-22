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
from pong.utils.async_logger import async_log

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


def send_direct_system_message(target_nickname, message):
    @async_to_sync
    async def async_send_direct_system_message():
        try:
            await async_log(f"send_system_message: start")

            target_user = await database_sync_to_async(CustomUser.objects.get)(nickname=target_nickname)
            system_user = await database_sync_to_async(CustomUser.objects.get)(is_system=True)
            # print(f"target_user.nickname: {target_user.nickname}")
            await async_log(f"send_direct_system_message(): target_user.nickname: {target_user.nickname}")

            dm_session = await database_sync_to_async(DMSession.get_session)(
                system_user.id,
                target_user.id,
                is_system_message=True
            )

            # メッセージをデータベースに保存
            message_instance = await database_sync_to_async(Message.objects.create)(
                sender=system_user,
                receiver=target_user,
                message=message
            )
            timestamp = message_instance.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            await async_log(f"message_instance.sender: {message_instance.sender}")

            channel_layer = get_channel_layer()
            # print(f"channel_layer: {channel_layer}")
            await DMConsumer.send_system_message(
                channel_layer,
                dm_session.id,
                system_user.nickname,
                message,
                timestamp,
                is_system_message=True
            )
            await async_log(f"send_system_message: done")

            # print(f"send_system_message: done")
            return True
        except CustomUser.DoesNotExist:
            # print(f"Error in send_direct_system_message: {str(e)}")
            return False
        except Exception as e:
            # print(f"Error in send_direct_system_message: {str(e)}")
            return False
    return async_send_direct_system_message()
    

# async def send_direct_system_message(target_nickname, message):
#     try:
#         await async_log(f"send_system_message: start")

#         target_user = await database_sync_to_async(CustomUser.objects.get)(nickname=target_nickname)
#         system_user = await database_sync_to_async(CustomUser.objects.get)(is_system=True)
#         # print(f"target_user.nickname: {target_user.nickname}")
#         await async_log(f"send_direct_system_message(): target_user.nickname: {target_user.nickname}")

#         dm_session = await database_sync_to_async(DMSession.get_session)(
#             system_user.id,
#             target_user.id,
#             is_system_message=True
#         )

#         # メッセージをデータベースに保存
#         message_instance = await database_sync_to_async(Message.objects.create)(
#             sender=system_user,
#             receiver=target_user,
#             message=message
#         )
#         timestamp = message_instance.timestamp.strftime("%Y-%m-%d %H:%M:%S")
#         await async_log(f"message_instance.sender: {message_instance.sender}")

#         channel_layer = get_channel_layer()
#         # print(f"channel_layer: {channel_layer}")
#         await DMConsumer.send_system_message(
#             channel_layer,
#             dm_session.id,
#             system_user.nickname,
#             message,
#             timestamp,
#             is_system_message=True
#         )
#         await async_log(f"send_system_message: done")

#         # print(f"send_system_message: done")
#         return True
#     except CustomUser.DoesNotExist:
#         # print(f"Error in send_direct_system_message: {str(e)}")
#         return False
#     except Exception as e:
#         # print(f"Error in send_direct_system_message: {str(e)}")
#         return False
