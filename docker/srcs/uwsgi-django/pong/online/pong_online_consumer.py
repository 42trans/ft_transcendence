# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py
import json
import logging
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import AllowAny, IsAuthenticated
from accounts.models import CustomUser
from .pong_online_game_manager import PongOnlineGameManager
from ..utils.async_logger import async_log

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
        # await async_log("ws接続されました")
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
        await async_log("room_group_nameが作成されました: " + self.room_group_name)
        self.game_manager = PongOnlineGameManager(self.user_id)
        await self.game_manager.initialize_game()
        await async_log("game_managerが作成されました")
        await self.accept()


    async def receive(self, text_data=None):
        """
        クライアントからの受信に応じて、初期情報や更新情報(物理判定後)をsendするメソッド
        - クライアントからの受信は key == objects (paddle, ball) のみ
        - クライエントへの送信は 全て（スコアなど）
        - Status Code: 参考:【RFC 6455 - The WebSocket Protocol】 <https://datatracker.ietf.org/doc/html/rfc6455#section-7.4.2>
        """
        await async_log("receive(): 開始")
        await async_log("クライアントからのtext_data受信: " + text_data)
        try:
            # text_data（WebSocket から受け取った生の文字列データ）を jsonに変換
            json_data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.close(code=1007)
            return

        try:
            if 'action' in json_data and json_data['action'] == 'initialize':
                await async_log("初回の処理----")
                # json: key==actionのみ
                await async_log("初回クライアントからの受信: " + json.dumps(json_data))
                initial_state = self.game_manager.pong_engine_data
                # json: key==全て(game_settingsを含む)
                await async_log("初回engine_data: " + json.dumps(initial_state))
                await self.send(text_data=json.dumps(initial_state))
            elif 'objects' in json_data:
                await async_log("更新時処理----")
                # json: key==objectsのみ
                await async_log("更新時クライアントからの受信: " + json.dumps(json_data))
                await self.game_manager.update_game(json_data['objects'])
                updated_state = self.game_manager.pong_engine_data
                # json: key==全て(game_settingsを含む)
                await async_log("更新時engine_data: " + json.dumps(updated_state))
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'send_data',
                    'data': updated_state
                })
            else:
                # 期待されるキーが含まれていない場合
                await self.send(text_data=json.dumps({"error": "Invalid request format"}))\
                # カスタム: RFC6455 WebSocket app 4000 + 400 Bad Request
                await self.close(code=4400)  
        except Exception as e:
            await self.send(text_data=json.dumps({"error": "Internal server error", "details": str(e)}))
            # カスタム: RFC6455 WebSocket app 4000 + 500 Internal server error
            await self.close(code=4500) 
    
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
        # return "test_room_group", None
        try:
            if other_user_id:
                room_group_name = f"room_{user_id}_{other_user_id}"
            else:
                room_group_name = f"room_{user_id}"
            # logging.info(f"Room group name generated successfully: {room_group_name}")
            return room_group_name, None
        except Exception as e:
            return None, str(e)
