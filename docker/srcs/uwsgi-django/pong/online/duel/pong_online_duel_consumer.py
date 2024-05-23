# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py
import json
import logging
from channels.db import database_sync_to_async
# from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import IsAuthenticated
from accounts.models import CustomUser
from .pong_online_duel_game_manager import PongOnlineDuelGameManager
from ...utils.async_logger import async_log
from accounts.models import CustomUser
from chat.models import DMSession, Message

class PongOnlineDuelConsumer(AsyncWebsocketConsumer):
    permission_classes = [IsAuthenticated]
    # クラスレベルの辞書を使用して部屋ごとの接続数を追跡
    connected_clients = {}

    async def connect(self):
        await async_log("開始:connect() ")
        # ルーム名を取得
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'duel_room_{self.room_name}'
        # ルームごとに接続数を初期化
        if self.room_group_name not in PongOnlineDuelConsumer.connected_clients:
            PongOnlineDuelConsumer.connected_clients[self.room_group_name] = 0
        # await async_log("終了:room_group_name ")

        try:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        except Exception as e:
            await async_log(f"Error: {str(e)}") 
            await self.close(code=1011) 
            return
        # await async_log("終了:group_add ")

        # ユーザーがログインしていることを確認
        if not self.scope["user"].is_authenticated:
            await self.close(code=1008)
            return
        await async_log(f'DuelConsumer: ws接続されました{self.scope["user"]}')
        await self.accept()

        # 接続数をインクリメント
        PongOnlineDuelConsumer.connected_clients[self.room_group_name] += 1
        connected_clients = PongOnlineDuelConsumer.connected_clients[self.room_group_name]
        await async_log(f"開始: 人数を数える {self.connected_clients}")
        # 2人揃ったらゲーム開始の合図を送信
        if connected_clients == 2: 
            try:
                await async_log("2名がinしました")
                self.game_manager = PongOnlineDuelGameManager()
                # self.game_manager = PongOnlineDuelGameManager(self.user_id)
                await self.game_manager.initialize_game()
                # await async_log("game_managerが作成されました")
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game.start',
                    }
                )
            except Exception as e:
                await async_log(f"Error: {str(e)}")
                await self.close(code=1011) 
                return
        else:  # まだ1人目の場合
            await self.send(text_data=json.dumps({
                'type': 'waiting_opponent',
                'message': 'Waiting for opponent...'
            }))

        await async_log("終了: connect()処理が正常終了")


    async def game_start(self, event):
        await self.send(text_data=json.dumps(event))

    async def waiting_opponent(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def send_dm_to_user(self, sender, recipient, message_text):
        session = DMSession.get_session(user_id=sender.id, other_user_id=recipient.id)
        message = Message(
            sender=sender,
            receiver=recipient,
            message=message_text
        )
        message.save()

    @database_sync_to_async
    def _get_user_by_nickname(self, nickname: str):
        return CustomUser.objects.get(nickname=nickname)



    async def receive(self, text_data=None):
        """
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
            # 2名からのスタートボタンのシグナルをもらったらボールサーブ
            if 'action' in json_data and json_data['action'] == 'initialize':
                # json: key==actionのみ
                await async_log("初回クライアントからの受信: " + json.dumps(json_data))
                initial_state = self.game_manager.pong_engine_data

                # json: key==全て(game_settingsを含む)
                await async_log("初回engine_data: " + json.dumps(initial_state))
                await self.send(text_data=json.dumps(initial_state))

            elif 'action' in json_data and json_data['action'] == 'reconnect':
                # await async_log("再接続時の処理----")
                # json: key==全て(game_settingsを含む)
                await async_log("再接続時: クライアントからの受信: " + json.dumps(json_data))
                await self.game_manager.restore_game_state(json_data)
                restored_state = self.game_manager.pong_engine_data
                
                # json: key==全て(game_settingsを含む)
                await async_log("再接続時: engine_data: " + json.dumps(restored_state))

                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'send_data',
                    'data': restored_state
                })

            elif 'action' in json_data and json_data['action'] == 'update':
            # elif 'objects' in json_data:

                # json: key==全て(game_settingsを含む)
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
        PongOnlineDuelConsumer.connected_clients[self.room_group_name] -= 1

        # ルームが空になったらエントリーを削除
        if PongOnlineDuelConsumer.connected_clients[self.room_group_name] == 0:
            del PongOnlineDuelConsumer.connected_clients[self.room_group_name]

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )



    @database_sync_to_async
    def _get_system_user(self):
        return CustomUser.objects.get(is_system=True)
    