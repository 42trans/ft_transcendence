# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py
import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import IsAuthenticated
from .pong_online_duel_game_manager import PongOnlineDuelGameManager
from .pong_online_duel_receive_handler import PongOnlineDuelReceiveHandler
from .pong_online_duel_config import g_GAME_MANAGERS_LOCK, game_managers
from ...utils.async_logger import async_log
from accounts.models import CustomUser
import gc

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

# ---------------------------------------------------------------
# connect
# ---------------------------------------------------------------
    async def connect(self):
        """ WebSocket 接続時の処理 """
        await async_log("開始:connect() ")
        try: 
            await self._init_game()
            await self._authenticate_and_accept()
            await self._handle_room_entry()
        except Exception as e:
            await async_log(f" error: {str(e)}")
            await self.close(code=1011)
            return
        await async_log("終了:connect() ")

    async def _init_game(self):
        """ GameManager(+ Redis) インスタンス作成 """
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        if self.room_name not in game_managers:
            game_managers[self.room_name] = PongOnlineDuelGameManager(self)
        self.game_manager = game_managers[self.room_name]
        await async_log(f"self.game_manager: {self.game_manager}")
        # Redisへの接続とルームの設定
        await self.game_manager.setup_room_and_redis()

    async def _authenticate_and_accept(self):
        """ ユーザー認証関連 """
        if not await self.authenticate_user():
            return
        await self.accept()
        # 特定ユーザーにsendするためにuser.idとchannel_nameを紐付け
        self.game_manager.register_channel(self.current_user_id, self.channel_name)

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
            await async_log(f"無効なユーザーID: self.current_user_id:{self.current_user_id}")
            await self.close()
            return False
        # ユーザーを登録
        self.game_manager.register_user(self.current_user_id)
        return True

    async def _handle_room_entry(self):
        """ ルームへの参加状況に応じた処理 """
        await async_log(f'ws接続 {self.scope["user"]}')
        if await self.game_manager.is_both_players_connected():
            await self.game_manager.handle_both_players_connected()
        else:
            await self.send_event_to_client({
                    "event_type": "duel.waiting_opponent",
                    "event_data": {
                        'message': 'Incoming hotshot! Better get your game face on...'
                    }
                })
# ---------------------------------------------------------------
# receive
# ---------------------------------------------------------------
    async def receive(self, text_data=None):
        """ WebSocket からメッセージを受信した際の処理 """
        # await async_log("クライアントから受信")
        handler = PongOnlineDuelReceiveHandler(self, self.game_manager)
        try:
            json_data = json.loads(text_data)
            # await async_log(f"json_data: {json_data}")
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
# ---------------------------------------------------------------
# disconnect
# ---------------------------------------------------------------
    async def disconnect(self, close_code):
        async with g_GAME_MANAGERS_LOCK:
            try:
                await self.clear_redis_room()
            except Exception as e:
                await async_log(f"Error: disconnect() failed: {e}")

    async def clear_redis_room(self):
        if self.game_manager.redis_client:
        # if hasattr(self, 'redis_client'):
            # srem: 現在のユーザーをRedisのセットから削除
            await database_sync_to_async(self.game_manager.redis_client.srem)(self.game_manager.room_group_name, self.scope["user"].id)
            # group_discard: Channel Layerのグループから削除
            await self.channel_layer.group_discard(
                self.game_manager.room_group_name,
                self.channel_name
            )
            # 最後のユーザーが切断した場合
            # scard(key): セット（key）内の要素数を返す。ルームに接続中のユーザー数を取得
            if await database_sync_to_async(self.game_manager.redis_client.scard)(self.game_manager.room_group_name) == 0:
                # delete(key): 指定されたキー（key）をRedisから削除
                await database_sync_to_async(self.game_manager.redis_client.delete)(self.game_manager.room_group_name)
                #　Redisクライアントとの接続をを閉じる
                self.game_manager.redis_client.close()
                del game_managers[self.room_name] 
                gc.collect() 
                await async_log(f"gc.colect() done")
                await async_log(f"{game_managers}")
# ---------------------------------------------------------------
# util 
# ---------------------------------------------------------------
    async def send_event_to_client(self, event):
        # """ クライアントにイベントを送信 """
        await self.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['event_data']
        }))

    async def send_game_state(self, game_state):
        """ ゲーム状態を全参加者に送信 """
        # グループ(内の全てのクライアント)にゲーム状態を送信する
        await self.channel_layer.group_send(self.game_manager.room_group_name, {
            # send_event_to_client()を呼び出す
            'type': 'send_event_to_client',
            'event_type': 'game_state',
            'event_data': game_state
        })


    @database_sync_to_async
    def _get_system_user(self):
        return CustomUser.objects.get(is_system=True)

    @database_sync_to_async
    def _get_user_by_nickname(self, nickname: str):
        return CustomUser.objects.get(nickname=nickname)


