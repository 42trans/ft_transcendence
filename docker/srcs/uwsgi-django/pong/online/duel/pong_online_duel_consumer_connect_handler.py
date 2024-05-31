# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_consumer_connect_handler.py
# from channels.db import database_sync_to_async
from .pong_online_duel_game_manager import PongOnlineDuelGameManager
from .pong_online_duel_resources import PongOnlineDuelResources
from ...utils.async_logger import async_log

# Dev時DEBUG用ログ出力を切り替え
ASYNC_LOG_FOR_DEV = 1

# ---------------------------------------------------------------
# connect
# ---------------------------------------------------------------
class PongOnlineDuelConnectHandler:
    """  Consumer.connect() の実装 """
    def __init__(self, consumer):
        self.consumer   = consumer
        self.resources =  PongOnlineDuelResources()
# ---------------------------------------------------------------
    async def handle(self):
        """ 接続処理 """
        if ASYNC_LOG_FOR_DEV:
            await async_log("開始: ConnectHandler()")
        await self._init_consumer()
        await self._build_game_manager()
        # Redisへの接続とルームの設定
        await self.game_manager.setup_duel_room(self.user_id)
        await self._add_user_to_system()
        await self._handle_room_entry()
        if ASYNC_LOG_FOR_DEV:
            await async_log("終了: ConnectHandler()")
# ---------------------------------------------------------------
    async def _init_consumer(self):
        if ASYNC_LOG_FOR_DEV:
            await async_log("開始: _init_consumer()")
        self.consumer.room_name         = self.consumer.scope['url_route']['kwargs']['room_name']
        self.consumer.room_group_name   = f'duel_{self.consumer.room_name}'
        self.consumer.user_id           = self.consumer.scope["user"].id
        self.user_id                    = self.consumer.user_id
        path_segments                   = self.consumer.scope['url_route']['kwargs']['room_name'].split('_')
        self.consumer.user1             = int(path_segments[1])
        self.consumer.user2             = int(path_segments[2])
        if ASYNC_LOG_FOR_DEV:
            # await async_log(f"user1: {self.consumer.user1}")
            # await async_log(f"user2: {self.consumer.user2}")
            await async_log("終了: _init_consumer()")
# ---------------------------------------------------------------
    async def _build_game_manager(self):
        """ GameManager(+ Redis) インスタンス作成 """
        if ASYNC_LOG_FOR_DEV:
            await async_log("開始: _build_game_manager()")
        game_managers = self.resources.get_game_managers()
        # ルーム名でGameManagerインスタンスを作り、グローバル辞書に登録。一つだけ作成
        if self.consumer.room_name not in game_managers:
            async with self.resources.get_game_managers_lock():
                game_managers[self.consumer.room_name] = PongOnlineDuelGameManager(self.consumer)
        # 登録済のインスタンスを取得
        self.consumer.game_manager  = game_managers[self.consumer.room_name]
        self.game_manager           = self.consumer.game_manager
# ---------------------------------------------------------------
    async def _add_user_to_system(self):
        """ ユーザー関連 """
        if ASYNC_LOG_FOR_DEV:
            await async_log("開始: _add_user_to_system()")
        if not await self._authenticate_user():
            return
        await self.consumer.accept()
        # GameManagerクラスに登録
        self.game_manager.register_user(self.user_id)
        # 特定ユーザーにsendするためにuser.idとchannel_nameを紐付け
        self.game_manager.register_channel(self.user_id, self.consumer.channel_name)
        # Channels Consumerのグループに追加（Duelルームにブロードキャストするグループ））
        # group_add: グループが存在しない場合は新たに作成し、存在する場合は既存のグループにconsumerを追加
        # room_group_name: 任意の名前、※コンストラクタで指定　ex. f'duel_{self.consumer.room_name}'
        # channel_name: 接続(user)毎に一つ割り当て　
        await self.consumer.channel_layer.group_add(
            self.consumer.room_group_name, 
            self.consumer.channel_name
        )
# ---------------------------------------------------------------
    async def _authenticate_user(self):
        """ユーザー認証"""
        if ASYNC_LOG_FOR_DEV:
            await async_log("開始: _authenticate_user()")
        if not self.consumer.scope["user"].is_authenticated:
            await self.consumer.close(code=1008)
            return False
        # ユーザーIDが一致しない場合は接続を拒否
        if (self.user_id != self.consumer.user1 and self.user_id != self.consumer.user2):
            await async_log(f"無効なユーザーID: self.user_id:{self.user_id}")
            await self.consumer.close()
            return False
        return True
# ---------------------------------------------------------------
    async def _handle_room_entry(self):
        """ ルームへの参加状況に応じた処理 """
        if ASYNC_LOG_FOR_DEV:
            await async_log("開始: _handle_room_entry()")
            await async_log(f'ws接続: {self.consumer.scope["user"]}, {self.consumer.scope["user"].id}')
        if await self.game_manager.is_both_players_connected():
            await self.game_manager.handle_both_players_connected()
        else:
            await self.game_manager.handle_waiting_players()