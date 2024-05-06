# chat/consumers.py

import json
from django.contrib.auth import get_user_model

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import IsAuthenticated

from accounts.models import CustomUser


class Consumer(AsyncWebsocketConsumer):
    permission_classes = [IsAuthenticated]

    async def connect(self, grop_name: str):
        self.room_group_name = grop_name

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

    # Receive from WebSocket
    async def receive(self, json_data):
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_data',
                'data': json_data
            }
        )

    # Send to WebSocket
    async def send_data(self, event):
        await self.send(text_data=json.dumps(event))


    @database_sync_to_async
    def _get_user_by_nickname(self, nickname: str):
        return CustomUser.objects.get(nickname=nickname)


    @database_sync_to_async
    def _get_room_group_name(self, model, user_id, other_user_id):
        """
        SessionModel.get_sessionからroom_group_nameを取得する関数
        Sessionの検索 or 作成のために、user_id, other_user_idが必要
        """
        try:
            session = model.get_session(user_id, other_user_id)
            room_group_name = f"room_{session.id}"
            return room_group_name, None
        except Exception as e:
            return None, str(e)
