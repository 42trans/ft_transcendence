# chat/consumers.py

import json
import logging

from django.contrib.auth import get_user_model

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import IsAuthenticated

from accounts.models import CustomUser


logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)

logger = logging.getLogger('chat')


class Consumer(AsyncWebsocketConsumer):
    permission_classes = [IsAuthenticated]

    async def connect(self, model, user_id, other_user_id):
        self.room_group_name, err = await self._get_room_group_name(model=model,
                                                                    user_id=user_id,
                                                                    other_user_id=other_user_id)
        if err is not None:
            # logger.debug(f'[Consumer]: Error: connect: {err}')
            await self.close(code=1007)  # 1007: Invalid data
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    # Leave room group
    async def disconnect(self, close_code):
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
    #  send() data is `'data': json_data` group_sent by receive()
    async def send_data(self, event):
        # logger.debug(f'[Consumer]: send_data: {json.dumps(event)}')
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
