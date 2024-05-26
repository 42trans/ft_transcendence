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

    ## Redisの作成は一つ:
    Redisクライアントは、game_managers にルーム名が登録されていない場合（つまり、ルームが初めて作成される場合）にのみ作成。
    ##更新はlockしてから:
    disconnect(): 複数のConsumerが同時に切断した場合に対応


    ## インスタンスの数について
    - Consumerクラスのインスタンス = 2: ws接続ごとに生成、つまりUser数
    - GameManager のインスタンス  = 1: ルームに一つ生成
    - redis cient               = 1: GameManager に一つ生成

    - 参考:【チャンネル レイヤー — Channels 4.0.0 ドキュメント】 <https://channels.readthedocs.io/en/stable/topics/channel_layers.html>
    - redis: インメモリデータストアの一種
    
    - async_log: 出力先 docker/srcs/uwsgi-django/pong/utils/async_log.log
    '''
    permission_classes = [IsAuthenticated]


    async def connect(self):
        """
        WebSocket 接続時の処理
        """
        # self.redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)
        await async_log("開始:connect() ")
        try: 
            # ユーザー認証
            if not await self.authenticate_user():
                return
            # Redisへの接続とルームの設定
            await self.setup_room_and_redis()

            await self.accept()
            await async_log(f'ws接続 {self.scope["user"]}')

            # Userとchannel_name（送信先）をマッピング
            self.game_manager.register_user(self.scope["user"].id)
            self.game_manager.register_channel(self.current_user_id, self.channel_name)

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
            game_managers[self.room_name].redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)

        self.game_manager = game_managers[self.room_name]
        self.redis_client = self.game_manager.redis_client

        self.room_group_name = f'duel_room_{self.room_name}'
        # Redis接続
        await self.connect_to_redis(self.scope["user"].id)
        # ルームに追加
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await async_log(f"room_group_name: {self.room_group_name}")
        # ゲーム状態の初期化
        await self.initialize_game_state()

    async def initialize_game_state(self):
        # Redis からゲーム状態の取得
        game_state = await database_sync_to_async(self.redis_client.get)(f"game_state:{self.room_name}")
        if game_state is None:
            # Redis にゲーム状態が保存されていない場合
            await self.game_manager.initialize_game()
            game_state = self.game_manager.get_state()
            await async_log(f"None game_state: {game_state}")
            await database_sync_to_async(self.redis_client.set)(f"game_state:{self.room_name}", json.dumps(game_state))
        else:
            # Redis にゲーム状態が保存されている場合
            game_state = json.loads(game_state)
            await async_log(f"Exist game_state: {game_state}")
            # Consumer インスタンス (self) が game_manager 属性を持っているかどうか
            if not hasattr(self, 'game_manager'):
                await self.game_manager.initialize_game()
            await self.game_manager.restore_game_state(game_state)

    async def connect_to_redis(self, current_user_id):
        """ 最大range回リトライ """
        # await async_log("開始:redis ")
        for _ in range(5): 
            try:
                await async_log(f"接続ユーザーID: {current_user_id}")
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

            # パドルの割り当て
            # self.connected_users: 接続されているユーザーIDのリスト
            for user_id in self.game_manager.get_user_ids():  
                if user_id not in self.game_manager.user_paddle_map:
                    self.game_manager.assign_paddle(user_id)
                
            # ルームにいる二人に向けて個別にパドル情報を送信
            for user_id in self.game_manager.get_user_ids():
                channel_name = self.game_manager.get_channel_name(user_id)
                paddle_info = self.game_manager.get_paddle_for_user(user_id)
                await async_log(f"send paddle_info {paddle_info}")
                # それぞれに送りたいので channel_name(1名ずつ)　宛に送る
                await self.channel_layer.send(channel_name, {
                    "type": "send_event_to_client",
                    "event_type": "duel.both_players_entered_room",
                    "event_data": {
                        'message': 'Both players have entered the room. Get ready!',
                        'paddle': paddle_info
                    }
                })
                
        else:
            # まだ1人目の場合、このインスタンスに接続しているUserに向けてsend
            await self.send_event_to_client({
                "event_type": "duel.waiting_opponent", 
                "event_data": {
                        'message': 'Incoming hotshot! Better get your game face on...'
                }
            })




    async def send_event_to_client(self, event):
        # """ クライアントにイベントを送信 """
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['event_data']
        }))

    async def send_game_state(self, game_state):
        """ ゲーム状態を全参加者に送信 """
        # グループ内の全てのクライアントにゲーム状態を送信する
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'send_event_to_client',
            'event_type': 'game_state',
            'event_data': game_state
        })




    async def disconnect(self, close_code):
        async with asyncio.Lock():
            try:
                await self.clear_redis_room()
            except Exception as e:
                await async_log(f"Error: disconnect() failed: {e}")

    async def clear_redis_room(self):
        if hasattr(self, 'redis_client'):
            # srem: 現在のユーザーをRedisのセットから削除
            await database_sync_to_async(self.redis_client.srem)(self.room_group_name, self.scope["user"].id)
            # group_discard: Channel Layerのグループから削除
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            # 最後のユーザーが切断した場合
            # scard(key): セット（key）内の要素数を返す。ルームに接続中のユーザー数を取得
            if await database_sync_to_async(self.redis_client.scard)(self.room_group_name) == 0:
                # delete(key): 指定されたキー（key）をRedisから削除
                await database_sync_to_async(self.redis_client.delete)(self.room_group_name)
                #　Redisクライアントとの接続をを閉じる
                self.game_manager.redis_client.close()
                del game_managers[self.room_name] 




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
