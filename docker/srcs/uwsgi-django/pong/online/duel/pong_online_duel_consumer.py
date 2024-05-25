# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py
import json
import asyncio
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import IsAuthenticated
from .pong_online_duel_game_manager import PongOnlineDuelGameManager
from .pong_online_duel_receive_handler import PongOnlineDuelReceiveHandler
from ...utils.async_logger import async_log
from accounts.models import CustomUser

import os
import redis
# Redis クライアントの初期化
redis_host = os.getenv('REDIS_HOST', 'redis')
redis_port = os.getenv('REDIS_PORT', 6379)

game_managers = {}


class PongOnlineDuelConsumer(AsyncWebsocketConsumer):
    '''
    2名のUserによるOnline Pong(Remote Play) の WebSocket Consumer
    参考:【チャンネル レイヤー — Channels 4.0.0 ドキュメント】 <https://channels.readthedocs.io/en/stable/topics/channel_layers.html>
    redis: インメモリデータストアの一種
    - async_log: 出力先 docker/srcs/uwsgi-django/pong/utils/async_log.log
    '''
    permission_classes = [IsAuthenticated]


    async def connect(self):
        """
        WebSocket 接続時の処理
        """
        self.redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)
        await async_log("開始:connect() ")
        try: 
            # ユーザー認証
            if not await self.authenticate_user():
                return
            # Redisへの接続とルームの設定
            await self.setup_room_and_redis()

            await self.accept()
            await async_log(f'ws接続 {self.scope["user"]}')

            # 接続ユーザー数の確認と対戦相手のチェック
            await self.check_connected_users()
        except Exception as e:
            await async_log(f" error: {str(e)}")
            # 1011: 予期しない状態または内部エラーが発生
            await self.close(code=1011)
            return


    async def authenticate_user(self):
        """ユーザー認証"""
        if not self.scope["user"].is_authenticated:
            await self.close(code=1008)
            return False
        # URLからuser_idとother_user_idを抽出
        path_segments = self.scope['url_route']['kwargs']['room_name'].split('_')
        user_id, other_user_id = int(path_segments[1]), int(path_segments[2])
        # 現在のユーザーIDを取得
        self.current_user_id = self.scope["user"].id
        # ユーザーIDが一致しない場合は接続を拒否
        if (self.current_user_id != user_id and self.current_user_id != other_user_id):
            await async_log(f"無効なユーザーID: self.current_user_id:{self.current_user_id}, user_id:{user_id}")
            await self.close()
            return False
        return True
    
    async def setup_room_and_redis(self):
        # ルーム名を取得
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        if self.room_name not in game_managers:
            game_managers[self.room_name] = PongOnlineDuelGameManager(self)
        self.game_manager = game_managers[self.room_name]

        self.room_group_name = f'duel_room_{self.room_name}'
        # Redis接続
        await self.connect_to_redis(self.scope["user"].id)
        # ルームに追加
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await async_log(f"room_group_name: {self.room_group_name}")
        # ゲーム状態の初期化
        await self.initialize_game_state()

    async def initialize_game_state(self):
        game_state = await database_sync_to_async(self.redis_client.get)(f"game_state:{self.room_name}")
        if game_state is None:
            # self.game_manager = PongOnlineDuelGameManager()
            await self.game_manager.initialize_game()
            game_state = self.game_manager.get_state()
            await async_log(f"1 game_state: {game_state}")
            await database_sync_to_async(self.redis_client.set)(f"game_state:{self.room_name}", json.dumps(game_state))
        else:
            game_state = json.loads(game_state)
            await async_log(f"2 game_state: {game_state}")
            if not hasattr(self, 'game_manager'):
                # self.game_manager = PongOnlineDuelGameManager()
                await self.game_manager.initialize_game()
            await self.game_manager.restore_game_state(game_state)

    async def connect_to_redis(self, current_user_id):
        """ 最大range回リトライ """
        # await async_log("開始:redis ")
        for _ in range(5): 
            try:
                await async_log(f"接続ユーザーID: {current_user_id}")
                # self.redis_client = redis.Redis(host=redis_host, port=redis_port)
                added = await database_sync_to_async(self.redis_client.sadd)(self.room_group_name, current_user_id)

                members = await database_sync_to_async(self.redis_client.smembers)(self.room_group_name)
                await async_log(f"セットのメンバー: {members}")

                if not added:
                    await async_log(f"ユーザーは既にルームにいます: {current_user_id}")
                    await self.close()
                    return
                # 接続成功
                break  
            except redis.exceptions.ConnectionError:
                await async_log("Redis への接続に失敗しました。リトライします...")
                await asyncio.sleep(1)
        else:
            await self.close(code=1011)
            return
        # await async_log("終了:redis ")

    async def check_connected_users(self):
        # 接続されているユーザー数を取得
        self.connected_user_count = await database_sync_to_async(self.redis_client.scard)(self.room_group_name)
        await async_log(f"connected_user_count: {self.connected_user_count}")
        # 2名インしたらメッセージを送信してconnect()処理終了
        await self.check_opponent_and_send_message()
        await async_log("正常終了: connect()")

    async def check_opponent_and_send_message(self):
        """対戦相手の確認とメッセージ送信"""
        if self.connected_user_count == 2:
            await async_log("2名がinしました")
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'duel.both_players_entered_room',
                'room_group_name': self.room_group_name,
                'message': 'Both players have entered the room. Get ready!'
            })
        else:
            # まだ1人目の場合
            await self.send(text_data=json.dumps({
                'type': 'duel.waiting_opponent',
                'message': 'Incoming hotshot! Better get your game face on...'
            }))

    async def duel_both_players_entered_room(self, event):
        """
        両方のプレイヤーがルームに入ったときに呼び出されるメソッド
        """
        await self.send(text_data=json.dumps({
            "type": "duel.both_players_entered_room",
            "room_group_name": event["room_group_name"],
            "message": event["message"],
        }))

    async def game_start(self, event):
        await self.send(text_data=json.dumps(event))

    async def waiting_opponent(self, event):
        await self.send(text_data=json.dumps(event))


    async def game_end(self, event):
        await self.send(text_data=json.dumps(event))

    async def send_game_state(self, game_state):
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'send_data',
            'data': game_state
        })

    async def send_data(self, event):
        await self.send(text_data=json.dumps(event['data']))

    async def disconnect(self, close_code):
        async with asyncio.Lock():
            await database_sync_to_async(self.redis_client.srem)(self.room_group_name, self.scope["user"].id)
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            await self.clear_redis_room()

    async def clear_redis_room(self):
        await database_sync_to_async(self.redis_client.delete)(self.room_group_name)

    @database_sync_to_async
    def _get_system_user(self):
        return CustomUser.objects.get(is_system=True)

    @database_sync_to_async
    def _get_user_by_nickname(self, nickname: str):
        return CustomUser.objects.get(nickname=nickname)




    async def receive(self, text_data=None):
        """WebSocket からメッセージを受信した際の処理"""
        handler = PongOnlineDuelReceiveHandler(self)
        try:
            json_data = json.loads(text_data)
            action = json_data.get('action')
            if action == 'start':
                await handler.handle_start_action(json_data)
            elif action == 'reconnect':
                await handler.handle_reconnect_action(json_data)
            elif action == 'update':
                await handler.handle_update_action(json_data)
            else:
                await handler.handle_invalid_action(json_data)
        except json.JSONDecodeError:
            await self.close(code=1007)
