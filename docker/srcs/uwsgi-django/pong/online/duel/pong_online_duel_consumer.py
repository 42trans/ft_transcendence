# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py
import json
# from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import IsAuthenticated
from .pong_online_duel_consumer_receive_handler import PongOnlineDuelReceiveHandler
from .pong_online_duel_consumer_connect_handler import PongOnlineDuelConnectHandler
from .pong_online_duel_consumer_disconnect_handler import PongOnlineDuelDisconnectHandler
from .pong_online_duel_consumer_util import PongOnlineDuelConsumerUtil
from ...utils.async_logger import async_log

# Dev時DEBUG用ログ出力を切り替え
ASYNC_LOG_FOR_DEV = 0

class PongOnlineDuelConsumer(AsyncWebsocketConsumer):
    '''
    2名のUserによるOnline Pong(Remote Play, Duel) の WebSocket Consumer
    Game に関する entry point でもある
    
    ## async logger
    - async_log: 出力先 docker/srcs/uwsgi-django/pong/utils/async_log.log
    ## Resoucesの更新はlockしてから:
    - 共通で利用する変数（ゲーム状態など）は resources のクラス変数を使用する。
    - 排他制御を行う
    ## ポイント :役割: インスタンスの数: 作成のロジックについて
    - Consumer: Websocket接続: インスタンスはws接続ごとに生成、つまりUser数 = 2: APIへのリクエスト時に作成
    - GameManager: Pong Game 本体に関するメソッド: ルームに一つ生成 = 1: game_managers にルーム名が登録されていない場合に作成
    - Redis client: Consumer間で共有したい情報を入れるメモリへアクセスするために使用: GameManager に一つ生成 = 1: 
      - 参考:【チャンネル レイヤー — Channels 4.0.0 ドキュメント】 <https://channels.readthedocs.io/en/stable/topics/channel_layers.html>

    ## DEBUG:
    - 以前のredisの情報をクリアする方法
      - docker exec redis redis-cli flushall
    '''
    # 注意：ここだけでは認証チェックとして不足
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name          = None
        self.game_manager       = None 
        self.room_group_name    = None
        self.user_id            = None 
        self.user1              = None
        self.user2              = None
# ---------------------------------------------------------------
# connect
# ---------------------------------------------------------------
    async def connect(self):
        """ 
        WebSocket接続の一番最初の処理
        Gameもここから呼び出される
        """
        # await async_log("開始:connect() ")
        try: 
            await PongOnlineDuelConnectHandler(self).handle()
        except Exception as e:
            await async_log(f" error: {str(e)}")
            await self.close(code=1011) #予期しない状態または内部エラー
            return
        # await async_log("終了:connect() ")
# ---------------------------------------------------------------
# receive
# ---------------------------------------------------------------
    async def receive(self, text_data=None):
        """ client(WebSocket接続)からメッセージを受信した際の処理 """
        # await async_log("開始:recieve(): クライアントから受信")
        try:
            handler     = PongOnlineDuelReceiveHandler(self, self.game_manager)
            json_data   = json.loads(text_data)
            action      = json_data.get('action')

            if   action == 'start':
                await handler.handle_start_action(json_data)
            elif action == 'reconnect':
                await handler.handle_reconnect_action(json_data)
            elif action == 'update':
                await handler.handle_update_action(json_data)
            else:
                await handler.handle_invalid_action()
        except Exception as e:
            await async_log(f" error: {str(e)}")
            await self.close(code=1011) #予期しない状態または内部エラー
            return
        # await async_log(f"終了: recieve(): action: {action}")
# ---------------------------------------------------------------
# disconnect
# ---------------------------------------------------------------
    async def disconnect(self, close_code):
        await PongOnlineDuelDisconnectHandler(self, self.game_manager).handle(close_code)
# ---------------------------------------------------------------
# util
# ---------------------------------------------------------------
    async def send_event_to_client(self, event):
        """ Utilクラスのsend_event_to_clientメソッドを呼び出す """
        await PongOnlineDuelConsumerUtil.send_each_client(self, event)

    async def send_game_state(self, game_state):
        """ Utilクラスのsend_game_stateメソッドを呼び出す """
        await PongOnlineDuelConsumerUtil.broadcast_game_state(self, game_state)