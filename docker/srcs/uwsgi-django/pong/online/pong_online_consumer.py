# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py
import json
import logging
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import AllowAny, IsAuthenticated
from accounts.models import CustomUser
from .pong_online_game_manager import PongOnlineGameManager

# """channelsなのかwsなのか、機能しなかったlogger"""
# import sys
# from channels.routing import get_default_application
# from channels.worker import Worker
# logger = logging.getLogger("django.channels.worker")
# logger = logging.getLogger(__name__)
# logger = logging.getLogger('ss-pong')
# logger = logging.getLogger("PongOnlineConsumer")

# # ---------------
# """機能した非同期カスタムロガー"""
# import aiofiles
# import asyncio
# import datetime
# async def async_log(message: str, file_path: str = "/code/pong/online/async_log.log"):
#     """非同期にメッセージをログファイルに書き込む"""
#     async with aiofiles.open(file_path, mode='a') as log_file:
#         timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
#         await log_file.write(f"{timestamp} - {message}\n")
# # ---------------

from ..utils.async_logger import async_log

class PongOnlineConsumer(AsyncWebsocketConsumer):
    permission_classes = [AllowAny]
    # permission_classes = [IsAuthenticated]

    async def connect(self):
        """
         - _get_room_group_name: ルームグループ名をuser IDから決定
         - self.channel_layer.group_add: ルームグループ名とチャンネル名を使ってルームグループに参加
         - self.channel_layer.group_add:複数の WebSocket 接続に対してメッセージを一斉に配信
         - self.channel_name: AsyncWebsocketConsumerの属性 unique ID
         - self.accept(): WebSocket接続を受け入れて送受信可能にする
        """
        await async_log("ws接続されました")
        # logger.debug("ws接続されました")

        self.user_id = self.scope['user'].id
        self.room_group_name, err = await self._get_room_group_name(self.user_id)
        if err is not None:
            await self.close(code=1007)
            return
        
        try:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        except Exception as e:
            await self.close(code=1011) 
            return

        self.game_manager = PongOnlineGameManager(self.user_id)
        await async_log("game_managerが作成されました")
        await self.accept()

    async def receive(self, text_data=None):
        try:
            await async_log(text_data)
            json_data = json.loads(text_data)
            await async_log(json.dumps(json_data))
        except json.JSONDecodeError:
            await self.close(code=1007)
            return

        # 初回通信: クライアントから合図を受け取って初期状態を送信
        if 'action' in json_data and json_data['action'] == 'initialize':
            # 初期状態を取得してJSON文字列に変換
            initial_state = self.game_manager.initialize_game()
            initial_state_json = json.dumps({"message": "Sending initial state", "state": initial_state})
            await async_log(json.dumps(initial_state_json))
            await self.send(text_data=initial_state_json)
        elif 'paddle1' in json_data or 'ball' in json_data:
            # ゲームの状態を更新
            updated_state = self.game_manager.update_game(json_data)
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_data',
                'data': updated_state
            })


    async def send_data(self, event):
        await self.send(text_data=json.dumps(event['data']))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )



    @database_sync_to_async
    def _get_user_by_nickname(self, nickname: str):
        return CustomUser.objects.get(nickname=nickname)

    @database_sync_to_async
    def get_user_information(self, user_id):
        return CustomUser.objects.get(id=user_id)

    @database_sync_to_async
    def _get_room_group_name(self, user_id, other_user_id=None):
        """
        SessionModel.get_sessionからroom_group_nameを取得する関数
        一人用または二人用のセッションの検索または作成のために使用
        other_user_idはオプション
        """
        try:
            if other_user_id:
                room_group_name = f"room_{user_id}_{other_user_id}"
            else:
                room_group_name = f"room_{user_id}"
            return room_group_name, None
        except Exception as e:
            return None, str(e)
