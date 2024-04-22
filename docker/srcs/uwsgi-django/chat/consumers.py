# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))


class DMConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['nickname']
        self.room_group_name = 'chat_%s' % self.nickname

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

# class DMConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         print(f'debug: Connect')
#         self.user = self.scope['user']
#         self.other_user_nickname = self.scope['url_route']['kwargs']['nickname']
#         print(f'debug: Connected to {self.other_user_nickname}')
#
#         # ニックネームから対象のユーザーオブジェクトを取得
#         User = get_user_model()
#         try:
#             other_user = User.objects.get(nickname=self.other_user_nickname)
#         except User.DoesNotExist:
#             await self.close()  # ユーザーが存在しない場合は接続を閉じる
#             return
#
#         # 両ユーザーのIDをソートして一意のグループ名を生成
#         sorted_user_ids = sorted([self.user.id, other_user.id])
#         self.room_group_name = f"dm_{sorted_user_ids[0]}_{sorted_user_ids[1]}"
#
#         # 同じグループ名に参加
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )
#
#         await self.accept()
#
#     async def disconnect(self, close_code):
#         print(f'debug: Disconnect')
#         # グループから離脱
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )
#
#     async def receive(self, text_data):
#         print(f'debug: Receive')
#         text_data_json = json.loads(text_data)
#         message = text_data_json['message']
#
#         # グループにメッセージを送信
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'dm_message',
#                 'message': message
#             }
#         )
#
#     async def dm_message(self, event):
#         print(f'debug: Message')
#         message = event['message']
#
#         # WebSocketにメッセージを送信
#         await self.send(text_data=json.dumps({
#             'message': message
#         }))
