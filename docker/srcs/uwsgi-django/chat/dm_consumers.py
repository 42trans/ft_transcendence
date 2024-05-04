# chat/consumers.py

import json
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import IsAuthenticated, AllowAny
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from accounts.models import CustomUser
from chat.models import DMSession, Message

import logging


logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)

logger = logging.getLogger(__name__)


def print_mazenta(text):
    print(f"\033[35m[DEBUG] {text}\033[0m")


class DMConsumer(AsyncWebsocketConsumer):
    permission_classes = [AllowAny]

    async def connect(self):
        try:
            print_mazenta(f'[DMConsumer]: Connect 1')

            self.user, self.other_user, self.system_user = await self.get_users()
            if self.other_user is None or self.system_user is None:
                print_mazenta(f'[DMConsumer]: Connect 2: other user not exist')
                await self.close()  # ユーザーが存在しない場合は接続を閉じる
                return

            self.is_system_message = self.scope['url_route']['kwargs'].get('is_system_message', False)

            print_mazenta(f'[DMConsumer]: Connect 3')
            # ChatSession を取得または作成
            self.chat_session = await self.get_dm_session(self.user.id, self.other_user.id)
            print_mazenta(f'[DMConsumer]: Connect 4')

            # グループ名をセッションIDを使用して設定
            self.room_group_name = f"chat_{self.chat_session.id}"
            print_mazenta(f'[DMConsumer]: Connect 5, group_name: {self.room_group_name}')
            # 同じグループ名に参加
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            print_mazenta(f'[DMConsumer]: Connect 6')
            await self.accept()

        except Exception as e:
            print_mazenta(f'[DMConsumer]: err: {str(e)}')


    async def disconnect(self, close_code):
        print_mazenta(f'[DMConsumer]: Disconnect code: {close_code}')
        # グループから離脱
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )


    async def receive(self, text_data):
        print_mazenta(f'[DMConsumer]: Receive')

        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # メッセージをデータベースに保存
        message_instance = await self.store_message(sender_id=self.user.id,
                                                    receiver_id=self.other_user.id,
                                                    message=message)
        timestamp = message_instance.timestamp.strftime("%Y-%m-%d %H:%M:%S")

        message_param = {
            'type': 'send_message',
            'sender': self.user.nickname,
            'message': message,
            'timestamp': timestamp,
            'is_system_message': False
        }
        # グループにメッセージを送信
        await self.channel_layer.group_send(self.room_group_name, message_param)


    async def send_message(self, event):
        print_mazenta(f'[DMConsumer]: send_message 1')

        message = event['message']
        sender = event['sender']
        timestamp = event['timestamp']
        is_system_message = event.get('is_system_message', False)  # システムメッセージフラグを取得

        # WebSocketにメッセージを送信
        message_data = {
            'sender': sender,
            'message': message,
            'timestamp': timestamp,
            'is_system_message': is_system_message
        }
        print_mazenta(f'[DMConsumer]: send_message 2')
        await self.send(text_data=json.dumps(message_data))


    @classmethod
    def send_system_message_to_channel(cls,
                                       message,
                                       target_user_id,
                                       system_user,
                                       timestamp):
        try:
            print_mazenta(f'[DMConsumer]: send_system_message 1, system_user: {system_user.nickname}')
            channel_layer = get_channel_layer()
            dm_session = DMSession.get_dm_session(target_user_id, system_user.id)
            print_mazenta(f'[DMConsumer]: send_system_message 2, session_id: {dm_session.id}')
            async_to_sync(channel_layer.group_send)(
                f'chat_{dm_session.id}',
                {
                    'type': 'send_message',
                    'sender': system_user.nickname,
                    'message': message,
                    'timestamp': timestamp,
                    'is_system_message': True
                }
            )
            print_mazenta(f'[DMConsumer]: send_system_message 3')
        except Exception as e:
            print_mazenta(f'[DMConsumer]: send_system_message 4: err: {str(e)}')


    async def get_users(self):
        user_nickname = self.scope['user'].nickname
        other_user_nickname = self.scope['url_route']['kwargs']['nickname']
        print_mazenta(f'[DMConsumer]: Connect 2 other_user_nickname: {other_user_nickname}')

        # DM送受信者のuser objectをnickanmeから取得
        user = await self.get_user_by_nickname(user_nickname)
        other_user = await self.get_user_by_nickname(other_user_nickname)
        system_user = await self.get_system_user()
        return user, other_user, system_user


    @database_sync_to_async
    def get_dm_session(self, user_id, other_user_id):
        # print_mazenta(f'[DMConsumer]: 3-1: get_dm_session user_id={user_id} other_user_id={other_user_id}')
        # return DMSession.get_dm_session(user_id, other_user_id)
        try:
            print_mazenta(f'[DMConsumer]: 3-1: get_dm_session user_id={user_id} other_user_id={other_user_id}')
            return DMSession.get_dm_session(user_id, other_user_id)
        except Exception as e:
            print_mazenta(f'[DMConsumer]: Error in get_dm_session: {str(e)}')
            return None


    @database_sync_to_async
    def user_exists(self, nickname):
        """Check if a user with the given nickname exists."""
        return CustomUser.objects.filter(nickname=nickname).exists()


    @database_sync_to_async
    def get_user_by_nickname(self, nickname: str) -> None:
        return CustomUser.objects.get(nickname=nickname)


    @database_sync_to_async
    def get_system_user(self) -> None:
        return CustomUser.objects.get(is_system=True)


    @database_sync_to_async
    def store_message(self, sender_id: int, receiver_id: int, message: str) -> None:
        print_mazenta(f'[DMConsumer] store_message: sender_id: {sender_id}, receiver_id: {receiver_id}, message: {message}')
        try:
            print_mazenta(f'[DMConsumer]store_message 1')
            sender = CustomUser.objects.get(id=sender_id)
            print_mazenta(f'[DMConsumer]store_message 2')
            receiver = CustomUser.objects.get(id=receiver_id)
            print_mazenta(f'[DMConsumer]store_message 3')
            message_instance = Message.objects.create(sender=sender,
                                                      receiver=receiver,
                                                      message=message)
            print_mazenta(f'[DMConsumer]store_message 4')
            return message_instance
        except Exception as e:
            print_mazenta(f'[DMConsumer]: Error storing message: {str(e)}')
            raise e
