# chat/consumers.py

import json
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import IsAuthenticated
from accounts.models import CustomUser


def print_mazenta(text):
    print(f"\033[35m[DEBUG] {text}\033[0m")


class DMConsumer(AsyncWebsocketConsumer):
    permission_classes = [IsAuthenticated]

    async def connect(self):
        print_mazenta(f'[DMConsumer]: Connect 1')

        if hasattr(self.scope['user'], 'nickname'):
            self.user = self.scope['user']
            self.user_nickname = self.user.nickname
        else:
            print_mazenta(f'[DMConsumer]: Unauthorized user attempt to connect')
            await self.close()
            return

        # self.user = self.scope['user']
        # self.user_nickname = self.user.nickname
        # self.user_nickname = self.scope['url_route']['kwargs']['sender']
        self.other_user_nickname = self.scope['url_route']['kwargs']['nickname']
        print_mazenta(f'[DMConsumer]: Connect 2 other_user_nickname: {self.other_user_nickname}')
        # print_mazenta(f'[DMConsumer]: Connect 2 sender: {self.user_nickname}')

        # ニックネームから対象のユーザーオブジェクトを取得
        if not await self.user_exists(self.other_user_nickname):
            print_mazenta(f'[DMConsumer]: user not exist')
            await self.close()  # ユーザーが存在しない場合は接続を閉じる
            return

        print_mazenta(f'[DMConsumer]: 3')
        # 両ユーザーのIDをソートして一意のグループ名を生成
        sorted_user_ids = sorted([self.user_nickname, self.other_user_nickname])
        self.room_group_name = f"dm_{sorted_user_ids[0]}_{sorted_user_ids[1]}"

        print_mazenta(f'[DMConsumer]: 4')
        # 同じグループ名に参加
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        print_mazenta(f'[DMConsumer]: 5')
        await self.accept()

    async def disconnect(self, close_code):
        print_mazenta(f'[DMConsumer]: Disconnect')
        # グループから離脱
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        print_mazenta(f'[DMConsumer]: Receive')
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # グループにメッセージを送信
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'dm_message',
                'message': message
            }
        )

    async def dm_message(self, event):
        print_mazenta(f'[DMConsumer]: Message')
        message = event['message']

        # WebSocketにメッセージを送信
        await self.send(text_data=json.dumps({
            'message': message
        }))


    @database_sync_to_async
    def user_exists(self, nickname):
        """Check if a user with the given nickname exists."""
        return CustomUser.objects.filter(nickname=nickname).exists()
