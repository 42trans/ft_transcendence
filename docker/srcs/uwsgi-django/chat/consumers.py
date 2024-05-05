# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated


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
