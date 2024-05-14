# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py

import json
import logging

from django.contrib.auth import get_user_model

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import IsAuthenticated

from accounts.models import CustomUser
from .pong_online_game_manager import PongOnlineGameManager

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)

logger = logging.getLogger('Pong online')


class PongOnlineConsumer(AsyncWebsocketConsumer):
    permission_classes = [IsAuthenticated]

    async def connect(self):
        """
         - _get_room_group_name: ルームグループ名をuser IDから決定
         - self.channel_layer.group_add: ルームグループ名とチャンネル名を使ってルームグループに参加
         - self.channel_layer.group_add:複数の WebSocket 接続に対してメッセージを一斉に配信
         - self.channel_name: AsyncWebsocketConsumerの属性 unique ID
         - self.accept(): WebSocket接続を受け入れて送受信可能にする
        """
        self.user_id = self.scope['user'].id
        # Get the room group name
        self.room_group_name, err = await self._get_room_group_name(
                                    # model=model,
                                    self.user_id
                                    # user_id=user_id,
                                    # other_user_id=other_user_id
                                    )
        if err is not None:
            # logger.debug(f'[Consumer]: Error: connect: {err}')
            await self.close(code=1007)  # 1007: Invalid data
            return

        try:
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        except Exception as e:
            logger.error(f'Failed to join room group: {str(e)}')
            # server error
            await self.close(code=1011) 
            return



        # ゲーム管理クラスの初期化
        self.game_manager = PongOnlineGameManager(self.user_id)



        # Accept the WebSocket connection
        await self.accept()

        # 接続成功メッセージを送信
        await self.send(text_data=json.dumps({
            'type': 'connect()',
            'message': 'Connected'
        }))


    async def disconnect(self, close_code):
        """
        Handle disconnection.
        close_code:
         - 1000（正常クローズ）
         - 1001（クライアントがページを離れた）
         - 1006（異常クローズ）
         - 1007（受信したデータがポリシー違反である場合）
        """
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        if close_code == 1000:
            logger.info(f'Connection closed normally [Room: {self.room_group_name}]')
        elif close_code == 1001:
            logger.info(f'Client has gone away [Room: {self.room_group_name}]')
        elif close_code == 1006:
            logger.warning(f'Abnormal closure [Room: {self.room_group_name}]')
        elif close_code == 1007:
            logger.error(f'Policy violation [Room: {self.room_group_name}]')
        else:
            logger.error(f'Unexpected close code: {close_code} [Room: {self.room_group_name}]')


    async def receive(self, text_data=None):
    # async def receive(self, json_data):　#jsonを直接受け取る場合
        """
        Receive from WebSocket
        """
        try:
            json_data = json.loads(text_data)
            logger.debug(f'Received data: {json_data}')  # ログ追加
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            await self.close(code=1007)  # Close connection on invalid data
            return



        # ゲーム管理クラスの更新処理を受け取るたびに行う？どこでするか後で検討
        state = self.game_manager.update_game(json_data)




        # Send updated state to room group
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'send_data',
            'data': state
        })

    async def send_data(self, event):
        """
        Send to WebSocket
         - send() data is `'data': json_data` group_sent by receive()
        """
        # logger.debug(f'[Consumer]: send_data: {json.dumps(event)}')
        await self.send(text_data=json.dumps(event['data']))


    @database_sync_to_async
    def _get_user_by_nickname(self, nickname: str):
        return CustomUser.objects.get(nickname=nickname)

    @database_sync_to_async
    def get_user_information(self, user_id):
        return CustomUser.objects.get(id=user_id)

    @database_sync_to_async
    def _get_room_group_name(self, user_id, other_user_id=None):
    # def _get_room_group_name(self, model, user_id, other_user_id=None): #modelを使う場合
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
