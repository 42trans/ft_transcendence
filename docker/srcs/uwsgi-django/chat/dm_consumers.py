# chat/consumers.py

import json
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import IsAuthenticated
from accounts.models import CustomUser
from chat.models import DMSession, Message


def print_mazenta(text):
    print(f"\033[35m[DEBUG] {text}\033[0m")


class DMConsumer(AsyncWebsocketConsumer):
    permission_classes = [IsAuthenticated]


    async def connect(self):
        print_mazenta(f'[DMConsumer]: Connect 1')

        self.user, self.other_user = await self.get_users()
        if self.other_user is None:
            print_mazenta(f'[DMConsumer]: other user not exist')
            await self.close()  # ユーザーが存在しない場合は接続を閉じる
            return

        print_mazenta(f'[DMConsumer]: 3')
        # ChatSession を取得または作成
        self.chat_session = await self.get_dm_session(self.user.id, self.other_user.id)
        print_mazenta(f'[DMConsumer]: 4')

        # グループ名をセッションIDを使用して設定
        self.room_group_name = f"chat_{self.chat_session.id}"
        print_mazenta(f'[DMConsumer]: 5, group_name: {self.room_group_name}')
        # 同じグループ名に参加
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        print_mazenta(f'[DMConsumer]: 6')
        await self.accept()


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
            'type': 'dm_message',
            'sender': self.user.nickname,
            'message': message,
            'timestamp': timestamp
        }
        # グループにメッセージを送信
        await self.channel_layer.group_send(self.room_group_name, message_param)


    async def dm_message(self, event):
        print_mazenta(f'[DMConsumer]: Message')
        message = event['message']
        sender = event['sender']
        timestamp = event['timestamp']

        # WebSocketにメッセージを送信
        message_data = {
            'sender': sender,
            'message': message,
            'timestamp': timestamp
        }
        await self.send(text_data=json.dumps(message_data))


    async def get_users(self):
        user_nickname = self.scope['user'].nickname
        other_user_nickname = self.scope['url_route']['kwargs']['nickname']
        print_mazenta(f'[DMConsumer]: Connect 2 other_user_nickname: {other_user_nickname}')

        # DM送受信者のuser objectをnickanmeから取得
        user = await self.get_user_by_nickname(user_nickname)
        other_user = await self.get_user_by_nickname(other_user_nickname)
        return user, other_user


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
