# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_game_manager.py
from ..pong_online_config import PongOnlineConfig
from ..pong_online_init import PongOnlineInit
# from ..pong_online_physics import PongOnlinePhysics

from .pong_online_duel_match import PongOnlineDuelMatch
from .pong_online_duel_room_manager import PongOnlineDuelRoomeManager
from .pong_online_duel_match_start_manager import PongOnlineDuelMatchStartManager
from .pong_online_duel_update import PongOnlineDuelUpdate
from .pong_online_duel_physics import PongOnlineDuelPhysics

from typing import Dict, Any
from ...utils.async_logger import async_log
from accounts.models import CustomUser
from .pong_online_duel_resources import PongOnlineDuelResources

# from .pong_online_duel_resources import g_redis_client, g_REDIS_STATE_LOCK
from channels.db import database_sync_to_async
import json

class PongOnlineDuelGameManager:
    """ room に対しインスタンスを一つだけ生成"""
    def __init__(self, consumer):
        self.config = PongOnlineConfig()
        self.room_manager = PongOnlineDuelRoomeManager(consumer)
        self.match_start_manager = PongOnlineDuelMatchStartManager(consumer, self)
        self.pong_engine_data: Dict[str, Any] = {
            "objects": {},
            "game_settings": {},
            "state": {},
            "is_running": None
        }
        self.match              = None
        self.physics            = None
        self.pong_engine_update = None
        self.consumer           = consumer
        # Userインスタンスとパドル名
        self.user_paddle_map: Dict[CustomUser, str]     = {}
        # Userインスタンス
        self.connected_users: list[CustomUser]          = []
        # user_id を key とし、channel_name を value とする辞書
        self.user_channels: Dict[int, str]              = {}
        # Redis client(値を入れるためのsetとは別。setに接続するためのアカウントのようなもの)はモジュールで一つだけ。configに置いた変数（グローバル変数的な用途）。他のクラスからはGameManagerを介して参照するために自身の属性として持っておく
        # Redis set: ex.key = f"game_state:{self.consumer.room_name}" 
        # self.redis_client       = g_redis_client
        self.resources           = PongOnlineDuelResources()
        self.redis_client       = self.resources.get_redis_client()
        self.room_group_name    = f'duel_{self.consumer.room_name}'
        self.current_user_id    = None
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
        await self.initialize_game_state()

    async def initialize_game_state(self):
        """
        ゲーム状態を初期化する
        - Redisのセット: f"game_state:{self.consumer.room_name}": ゲームの状態に使用
        """
        await self.initialize_game()
        game_state = self.pong_engine_data
        # await async_log(f"None game_state: {game_state}")
        
        # 新規ゲーム状態をRedis f"game_state: に保存
        async with self.resources.get_game_redis_state_lock():
        # async with g_REDIS_STATE_LOCK:
            await database_sync_to_async(self.redis_client.set)(
                f"game_state:{self.consumer.room_group_name}", json.dumps(game_state)
            )

        # 予期せぬ切断に備えて再接続時の処理の下書き ※現在作成中
        # game_state = await database_sync_to_async(self.redis_client.get)(
        #     f"game_state:{self.consumer.room_name}"
        # )
        # if game_state is None:
        #     # Redis にゲーム状態が保存されていない場合
        #     await self.initialize_game()
        #     game_state = self.get_state()
        #     # await async_log(f"None game_state: {game_state}")
        #     await database_sync_to_async(self.redis_client.set)(
        #         f"game_state:{self.consumer.room_name}", json.dumps(game_state)
        #     )
        # else:
        #     # Redis にゲーム状態が保存されている場合
        #     game_state = json.loads(game_state)
        #     # await async_log(f"Exist game_state: {game_state}")
        #     await self.restore_game_state(game_state)

    async def initialize_game(self):
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
        # await async_log(f"initialize_game().pong_engine_data: {self.pong_engine_data}")
        return self
# ---------------------------------------------------------------
# match_start
# ---------------------------------------------------------------
    async def is_both_players_connected(self):
        """2人のプレイヤーが接続されているかどうかを判定する"""
        # await async_log("開始: is_both_players_connected()")
        # await async_log(f"開始: 2人のプレイヤーが接続されているかどうかを判定する is_both_players_connected()")
        path_segments = self.consumer.scope['url_route']['kwargs']['room_name'].split('_')
        user1, user2 = int(path_segments[1]), int(path_segments[2])

        is_user1_connected = await self.room_manager.is_user_connected_to_room(user1)
        is_user2_connected = await self.room_manager.is_user_connected_to_room(user2)
        # await async_log(f"is_user1_connected 3: {is_user1_connected}")
        # await async_log(f"is_user2_connected 6: {is_user2_connected}")
        return is_user1_connected and is_user2_connected


    async def handle_both_players_connected(self):
        """2人のプレイヤーが接続された場合の処理"""
        # await async_log(f"開始: handle_both_players_connected()")
        await self.match_start_manager.handle_both_players_connected()
# ---------------------------------------------------------------
# 
# ---------------------------------------------------------------
    def register_channel(self, user_id, channel_name):
        """ユーザーIDとチャネル名のマッピングを登録"""
        self.user_channels[user_id] = channel_name

    def register_user(self, user_id):
        """ユーザーを登録する"""
        if user_id not in self.connected_users:
            self.connected_users.append(user_id)

    def get_user_ids(self):
        """接続されているユーザーのIDリストを返す"""
        return self.connected_users

    def get_state(self):
        return self.pong_engine_data

    async def update_game(self, json_data, user_id):
        # await async_log(f"pong_engine_update.update_game: {json_data}, user_id:{user_id}")
        await self.pong_engine_update.update_game(json_data, user_id)
        return self


    async def restore_game_state(self, client_json_state):
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

