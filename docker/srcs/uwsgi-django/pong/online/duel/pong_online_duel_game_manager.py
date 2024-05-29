# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_game_manager.py
from ..pong_online_config import PongOnlineConfig
from ..pong_online_init import PongOnlineInit

from .pong_online_duel_match import PongOnlineDuelMatch
from .pong_online_duel_room_manager import PongOnlineDuelRoomeManager
from .pong_online_duel_match_start_manager import PongOnlineDuelMatchStartManager
from .pong_online_duel_update import PongOnlineDuelUpdate
from .pong_online_duel_physics import PongOnlineDuelPhysics
from .pong_online_duel_resources import PongOnlineDuelResources

from typing import Dict, Any
from ...utils.async_logger import async_log
from accounts.models import CustomUser
# from channels.db import database_sync_to_async
# import json

# Dev時DEBUG用ログ出力を切り替え
ASYNC_LOG_FOR_DEV = 0

class PongOnlineDuelGameManager:
    """ room に対しインスタンスを一つだけ生成"""
    def __init__(self, consumer):
        self.config                 = PongOnlineConfig()
        self.room_manager           = PongOnlineDuelRoomeManager(consumer)
        self.match_start_manager    = PongOnlineDuelMatchStartManager(consumer, self)
        self.resources              = PongOnlineDuelResources()
        self.pong_engine_data: Dict[str, Any] = {
            "objects": {},
            "game_settings": {},
            "state": {},
            "is_running": None
        }
        self.match              = None
        self.physics            = None
        self.pong_engine_update = None
        self.current_user_id    = None
        self.consumer           = consumer

        self.user_paddle_map: Dict[int, str]     = {}
        self.connected_users: list[int]          = []
        # user_id を key とし、channel_name(特定のConsumerインスタンスとやり取りするための宛先アドレス) を value とする辞書
        self.user_channels: Dict[int, str]              = {}

        self.room_group_name    = f'duel_{self.consumer.room_name}'
        self.redis_client       = self.resources.get_redis_client()
# ---------------------------------------------------------------
# room_manager
# ---------------------------------------------------------------
    async def setup_duel_room(self, current_user_id):
        """ 
        Redisのセットを作成: Redisのセットはルーム単位で作成
        参考:【チャンネル レイヤー — Channels 4.0.0 ドキュメント】 <https://channels.readthedocs.io/en/stable/topics/channel_layers.html>
        """
        await self.room_manager.setup_duel_room_redis_store(current_user_id)
        # ゲーム状態の初期化
        await self.initialize_game()
        # Redisにバックアップを取る場合(Djangoサーバーのダウンに備える目的で別サーバーにメモリを避難)
        # await self.init_game_state_redis()

    async def initialize_game(self):
        if ASYNC_LOG_FOR_DEV:
            await async_log("開始: initialize_game()")
        init                    = PongOnlineInit(self.config)
        self.pong_engine_data   = init.init_pong_engine()
        self.match              = PongOnlineDuelMatch(self.pong_engine_data, self.consumer)
        self.physics            = PongOnlineDuelPhysics(self.pong_engine_data)
        self.pong_engine_update = PongOnlineDuelUpdate(
            self.consumer,
            self,
            self.pong_engine_data,
            self.physics,
            self.match
        )
        if ASYNC_LOG_FOR_DEV:
            # await async_log(f"initialize_game().pong_engine_data: {self.pong_engine_data}")
            await async_log("終了: initialize_game()")
        return self
    
    # async def init_game_state_redis(self):
    #     """
    #     Redisにゲーム状態を保存する
    #     - Redisのセット: f"game_state:{self.consumer.room_name}": ゲームの状態に使用
    #     """
    #     # --------------------------------------------
    #     # 新規ゲーム状態をRedis f"game_state: に保存
    #     # --------------------------------------------
    #     async with self.resources.get_game_redis_state_lock():
    #         await database_sync_to_async(self.redis_client.set)(
    #             f"game_state:{self.consumer.room_group_name}", json.dumps(game_state)
    #         )
    #     # --------------------------------------------
    #     # 予期せぬ切断に備えて再接続時の処理の下書き ※現在作成中
    #     game_state = await database_sync_to_async(self.redis_client.get)(
    #         f"game_state:{self.consumer.room_name}"
    #     )
    #     if game_state is None:
    #         # Redis にゲーム状態が保存されていない場合
    #         await self.initialize_game()
    #         game_state = self.get_state()
    #         # await async_log(f"None game_state: {game_state}")
    #         await database_sync_to_async(self.redis_client.set)(
    #             f"game_state:{self.consumer.room_name}", json.dumps(game_state)
    #         )
    #     else:
    #         # Redis にゲーム状態が保存されている場合
    #         game_state = json.loads(game_state)
    #         # await async_log(f"Exist game_state: {game_state}")
    #         await self.restore_game_state(game_state)
    #     # --------------------------------------------
# ---------------------------------------------------------------
# match_start
# ---------------------------------------------------------------
    async def is_both_players_connected(self):
        """2人のプレイヤーが接続されているかどうかを判定する"""
        if ASYNC_LOG_FOR_DEV:
            await async_log("開始: is_both_players_connected()")
        user1 = self.consumer.user1
        user2 = self.consumer.user2
        is_user1_connected = await self.room_manager.is_user_connected_to_room(user1)
        is_user2_connected = await self.room_manager.is_user_connected_to_room(user2)
        if ASYNC_LOG_FOR_DEV:
            # await async_log(f"is_user1_connected 3: {is_user1_connected}")
            # await async_log(f"is_user2_connected 6: {is_user2_connected}")
            await async_log(f"開始: 2人のDuelルーム接続を判定 {is_user1_connected and is_user2_connected}")
            await async_log("終了:is_both_players_connected()")
        return is_user1_connected and is_user2_connected

    async def handle_both_players_connected(self):
        """2人のプレイヤーが接続された場合の処理"""
        if ASYNC_LOG_FOR_DEV:
            await async_log(f"開始: handle_both_players_connected()")
        await self.match_start_manager.handle_both_players_connected()

    async def handle_waiting_players(self):
        if ASYNC_LOG_FOR_DEV:
            await async_log(f"開始: handle_waiting_players()")
        await self.consumer.send_event_to_client({
                    "event_type": "duel.waiting_opponent",
                    "event_data": {
                        'message': 'Incoming hotshot! Better get your game face on...'
                    }
                })
# ---------------------------------------------------------------
# game_state
# ---------------------------------------------------------------
    async def update_game(self, json_data, user_id):
        if ASYNC_LOG_FOR_DEV:
            # await async_log(f"pong_engine_update.update_game: {json_data}, user_id:{user_id}")
            await async_log(f"開始: GameManager.update_game()")
        await self.pong_engine_update.update_game(json_data, user_id)
        return self

    async def restore_game_state(self, client_json_state):
        if ASYNC_LOG_FOR_DEV:
            await async_log(f"開始: restore_game_state()")
        try:
            if "game_settings" in client_json_state:
                self.pong_engine_data["game_settings"].update(client_json_state["game_settings"])
            if "objects" in client_json_state:
                for key in ["ball", "paddle1", "paddle2"]:
                    if key in client_json_state["objects"]:
                        self.pong_engine_data["objects"][key].update(client_json_state["objects"][key])
            if "state" in client_json_state:
                self.pong_engine_data["state"].update(client_json_state["state"])
            if "is_running" in client_json_state:
                self.pong_engine_data["is_running"] = client_json_state["is_running"]
            await async_log(f"Restored game state successfully.")
        except Exception as e:
            await async_log(f"Failed to restore game state: {str(e)}")
            raise e
# ---------------------------------------------------------------
# getter & setter
# ---------------------------------------------------------------
    def register_channel(self, user_id, channel_name):
        """ユーザーIDとチャネル名のマッピングを登録"""
        self.user_channels[user_id] = channel_name

    def register_user(self, user_id):
        """ユーザーを登録する"""
        if user_id not in self.connected_users:
            self.connected_users.append(user_id)

    def get_user_ids(self):
        """接続されているユーザーのリストを返す"""
        return self.connected_users

    def get_state(self):
        return self.pong_engine_data


