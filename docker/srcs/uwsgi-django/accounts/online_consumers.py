# chat/consumers.py

import json
import logging
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated, AllowAny

from accounts.models import CustomUser, UserStatus


logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)

logger = logging.getLogger('accounts')


class OnlineStatusConsumer(AsyncWebsocketConsumer):
    permission_classes = [IsAuthenticated]

    async def connect(self):
        # logger.debug(f'[OnlineStatusConsumer]: connect 1')
        self.user_id = self.scope["user"].id
        # logger.debug(f'[OnlineStatusConsumer]: connect 2: user: {self.scope["user"].nickname}')

        self.group_name = "online_status"
        # logger.debug(f'[OnlineStatusConsumer]: connect 3: group_name: {self.group_name}')

        # logger.debug(f'[OnlineStatusConsumer]: connect 4')

        # ユーザーグループに接続
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        # logger.debug(f'[OnlineStatusConsumer]: connect 5')
        await self.accept()

        # logger.debug(f'[OnlineStatusConsumer]: connect 6')
        # ユーザーをオンラインに設定
        await self.update_user_status( True)

    async def disconnect(self, close_code):
        # logger.debug(f'[OnlineStatusConsumer]: disconnect')
        # ユーザーをオフラインに設定
        await self.update_user_status( False)

        # グループから切断
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # logger.debug(f'[OnlineStatusConsumer]: receive')

        data = json.loads(text_data)
        user_id = data['user_id']
        status = data['status']

        # 同じグループ内の他のユーザーにステータスをブロードキャスト
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type'      : 'broadcast_status',
                'user_id'   : user_id,
                'status'    : status
            }
        )

    async def broadcast_status(self, event):
        # logger.debug(f'[OnlineStatusConsumer]: broadcast_status')
        # イベントからステータスを取得
        user_id = event['user_id']
        status = event['status']

        # WebSocketを通じてクライアントにステータスを送信
        await self.send(text_data=json.dumps({
            'user_id'   : user_id,
            'status'    : status
        }))

    @database_sync_to_async
    def update_user_status(self, status):
        # logger.debug(f'[OnlineStatusConsumer]: connect 4')
        try:
            user_status, _ = UserStatus.objects.get_or_create(user_id=self.user_id)
            user_status.is_online = status
            user_status.last_online = now()
            user_status.save()
        except Exception as e:
            logger.error(f'[OnlineStatusConsumer]: Unexpected error: {str(e)}')
