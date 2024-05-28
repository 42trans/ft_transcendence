# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_consumer_connect_handler.py
from channels.db import database_sync_to_async
from .pong_online_duel_game_manager import PongOnlineDuelGameManager
from .pong_online_duel_config import g_GAME_MANAGERS_LOCK, game_managers
from ...utils.async_logger import async_log

class PongOnlineDuelConnectHandler:
    '''  Consumer.connect() の実装 '''
# ---------------------------------------------------------------
# connect
# ---------------------------------------------------------------
    def __init__(self, consumer):
        self.consumer   = consumer

    async def handle(self):
        """ 接続処理 """
        # await async_log("開始: ConnectHandler()")
        await self._init_consumer()
        await self._init_game_manager()
        await self._accept_user()
        await self._handle_room_entry()
        # await async_log("終了: ConnectHandler()")

    async def _init_consumer(self):
        self.consumer.room_name         = self.consumer.scope['url_route']['kwargs']['room_name']
        self.consumer.room_group_name   = f'duel_{self.consumer.room_name}'
        self.consumer.user_id           = self.consumer.scope["user"].id
        self.user_id                    = self.consumer.user_id
        # await async_log(f"consumer.room_group_name: {self.consumer.room_group_name}")
        # await async_log(f"consumer.user_id: {self.consumer.user_id}")

    async def _init_game_manager(self):
        """ GameManager(+ Redis) インスタンス作成 """
        # 一つだけルーム名でGameManagerインスタンスを作り、グローバル辞書に登録
        if self.consumer.room_name not in game_managers:
            async with g_GAME_MANAGERS_LOCK:
                game_managers[self.consumer.room_name] = PongOnlineDuelGameManager(self.consumer)

                # TODO_ft: 2回行われるので冗長。他の初期化方法を検討する
                key_exists = await database_sync_to_async(game_managers[self.consumer.room_name].redis_client.exists)(
                    game_managers[self.consumer.room_name].room_group_name
                )
                if key_exists:
                    await async_log(f"Previous Redis data for room '''{game_managers[self.consumer.room_name].room_group_name}''' exists and will be deleted.")
                    # 前回のルーム情報を削除して初期化する。
                    await database_sync_to_async(game_managers[self.consumer.room_name].redis_client.delete)(
                        game_managers[self.consumer.room_name].room_group_name
                    )

        # 登録されているインスタンスを取得
        self.consumer.game_manager = game_managers[self.consumer.room_name]
        # await async_log(f"self.consumer.game_manager: {self.consumer.game_manager}")
        # Redisへの接続とルームの設定
        await self.consumer.game_manager.setup_duel_room(self.user_id)

    async def _accept_user(self):
        """ ユーザー関連 """
        # 認証
        if not await self._authenticate_user():
            return
        await self.consumer.accept()
        
        # GameManagerクラスに登録
        self.consumer.game_manager.register_user(self.user_id)
        # 特定ユーザーにsendするためにuser.idとchannel_nameを紐付け
        self.consumer.game_manager.register_channel(self.user_id, self.consumer.channel_name)

        # Channels Consumerのグループに追加（Duelルームにブロードキャストするグループ））
        # group_add: グループが存在しない場合は新たに作成し、存在する場合は既存のグループにconsumerを追加
        # room_group_name: 任意の名前、※コンストラクタで指定　ex. f'duel_{self.consumer.room_name}'
        # channel_name: 接続(user)毎に一つ割り当て　
        await self.consumer.channel_layer.group_add(
            self.consumer.room_group_name, 
            self.consumer.channel_name
        )

    async def _authenticate_user(self):
        """ユーザー認証"""
        if not self.consumer.scope["user"].is_authenticated:
            await self.consumer.close(code=1008)
            return False
        # URLからuser_idとother_user_idを抽出
        path_segments = self.consumer.scope['url_route']['kwargs']['room_name'].split('_')
        user1, user2 = int(path_segments[1]), int(path_segments[2])
        # ユーザーIDが一致しない場合は接続を拒否
        if (self.user_id != user1 and self.user_id != user2):
            await async_log(f"無効なユーザーID: self.user_id:{self.user_id}")
            await self.consumer.close()
            return False
        return True

    async def _handle_room_entry(self):
        """ ルームへの参加状況に応じた処理 """
        # await async_log("開始: _handle_room_entry()")
        # await async_log(f'ws接続 {self.consumer.scope["user"]}, {self.consumer.scope["user"].id}')
        # await async_log(f'self.user_id, {self.user_id}')
        if await self.consumer.game_manager.is_both_players_connected():
            await self.consumer.game_manager.handle_both_players_connected()
        else:
            # TODO_ft:関数名が思いついたら分離する
            await self.consumer.send_event_to_client({
                    "event_type": "duel.waiting_opponent",
                    "event_data": {
                        'message': 'Incoming hotshot! Better get your game face on...'
                    }
                })