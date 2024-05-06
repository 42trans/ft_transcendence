# chat/consumers.py

import json
import logging
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated, AllowAny

from accounts.models import CustomUser
from chat.consumers import Consumer
from chat.models import DMSession, Message


logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)

logger = logging.getLogger(__name__)


class DMConsumer(Consumer):
    """
    Websocket consumer class to handle DM
    """
    permission_classes = [AllowAny]

    async def connect(self):
        """
        websocket接続時に呼ばれる関数
        """
        try:
            # user, other_user, is_system_message をclass変数にセット
            err = await self._get_dm_consumer_params()
            if err is not None:
                logger.error(f'[DMConsumer]: Error: connect: {err}')
                await self.close(code=1007)  # 1007: Invalid data
                return

            # channel_layerのroom_group_nameを設定
            self.room_group_name, err = await self._get_room_group_name(model=DMSession,
                                                                        user_id=self.user.id,
                                                                        other_user_id=self.other_user.id)
            if err is not None:
                logger.error(f'[DMConsumer]: Error: connect: {err}')
                await self.close(code=1007)  # 1007: Invalid data
                return

            # Consumer classのconnect()を呼び出す
            await super().connect(grop_name=self.room_group_name)

        except Exception as e:
            logger.error(f'[DMConsumer]: Error: connect: {str(e)}')
            await self.close(code=1011)  # 1011: Internal error


    async def receive(self, text_data):
        """
        #message-submit でWebSocketを通じてサーバーがメッセージを受信すると呼ばれる関数
        メッセージをDBに保存し、groupにmessage_dataを送信する
        """
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']

            # メッセージをデータベースに保存
            message_instance = await self._store_message_to_db(sender_id=self.user.id,
                                                               receiver_id=self.other_user.id,
                                                               message=message)

            # 受信したメッセージからmessage_dataを作成し、send_dataに整形
            send_data = self._get_send_data(message_instance)

            # グループにsend_dataを送信 -> send_message()
            await super().receive(json_data=json.dumps(send_data))

        except json.JSONDecodeError as e:
            logger.error(f'[DMConsumer]: Error: Invalid JSON data: {str(e)}')
            await self.close(code=1007)  # 1007: Invalid data
        except Exception as e:
            logger.error(f'[DMConsumer]: Error: receive: {str(e)}')
            await self.close(code=1011)  # 1011: Internal error


    def _get_send_data(self, message_instance):
        message = message_instance.message
        timestamp = message_instance.timestamp.strftime("%Y-%m-%d %H:%M:%S")

        send_data = {
            'sender'            : self.user.nickname,
            'message'           : message,
            'timestamp'         : timestamp,
            'is_system_message' : False
        }
        return send_data


    # todo: 機能していないかも
    @classmethod
    def send_system_message_to_channel(cls,
                                       message,
                                       target_user_id,
                                       timestamp):
        """"
        API経由でWebSocketにmessageを送信する際に呼ばれる関数（機能していないかも？）
        system messageの送信に使用
        """
        try:
            system_user = self._get_system_user()

            channel_layer = get_channel_layer()
            dm_session = DMSession.get_session(user_id=system_user,
                                               other_user_id=target_user_id)
            async_to_sync(channel_layer.group_send)(
                f'room_{dm_session.id}',
                {
                    'type'              : 'send_message',
                    'sender'            : system_user.nickname,
                    'message'           : message,
                    'timestamp'         : timestamp,
                    'is_system_message' : True
                }
            )
        except Exception as e:
            logger.error(f'[DMConsumer]: Error: send_system_message: {str(e)}')
            raise e


    async def _get_dm_consumer_params(self):
        self.user, self.other_user, err = await self._get_users()
        if err is not None:
            return err

        # unused
        self.is_system_message = self.scope['url_route']['kwargs'].get('is_system_message', False)
        return None


    async def _get_users(self):
        # DM送受信者のuser objectをnickanmeから取得
        try:
            user_nickname = self.scope['user'].nickname
            other_user_nickname = self.scope['url_route']['kwargs']['nickname']

            user = await self._get_user_by_nickname(nickname=user_nickname)
            other_user = await self._get_user_by_nickname(nickname=other_user_nickname)
            return user, other_user, None

        except CustomUser.DoesNotExist:
            err = "user does not exist"
            return None, None, None, err
        except Exception as e:
            return None, None, None, str(e)


    @database_sync_to_async
    def _get_system_user(self):
        return CustomUser.objects.get(is_system=True)


    @database_sync_to_async
    def _store_message_to_db(self,
                             sender_id: int,
                             receiver_id: int,
                             message: str) -> None:
        try:
            sender = CustomUser.objects.get(id=sender_id)
            receiver = CustomUser.objects.get(id=receiver_id)
            message_instance = Message.objects.create(sender=sender,
                                                      receiver=receiver,
                                                      message=message)
            return message_instance
        except Exception as e:
            logger.error(f'[DMConsumer]: Error: storing message: {str(e)}')
            raise e
