from ..pong_online_config import PongOnlineConfig
from ..pong_online_init import PongOnlineInit
from ..pong_online_update import PongOnlineUpdate
from ..pong_online_physics import PongOnlinePhysics
from ..pong_online_match import PongOnlineMatch
from .pong_online_duel_match import PongOnlineDuelMatch
import logging
from typing import Dict, Any
from ...utils.async_logger import async_log
import asyncio

game_managers_lock = asyncio.Lock() 

logger = logging.getLogger(__name__)

class PongOnlineDuelGameManager:
    """ room に対しインスタンスを一つだけ生成"""
    def __init__(self, consumer):
        self.config = PongOnlineConfig()
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
        self.user_paddle_map    = {}
        self.connected_users    = []
        # user_id を key とし、channel_name を value とする辞書
        self.user_channels      = {}  
        
    async def initialize_game(self):
        init                    = PongOnlineInit(self.config)
        self.pong_engine_data   = init.init_pong_engine()
        self.match              = PongOnlineDuelMatch(self.pong_engine_data, self.consumer)
        self.physics            = PongOnlinePhysics(self.pong_engine_data)
        self.pong_engine_update = PongOnlineUpdate(
            self.pong_engine_data,
            self.physics,
            self.match
        )
        # await async_log("initialize_game().pong_engine_data: ")
        # await async_log(self.pong_engine_data)
        return self

    def register_channel(self, user_id, channel_name):
        """ユーザーIDとチャネル名のマッピングを登録"""
        self.user_channels[user_id] = channel_name

    def get_channel_name(self, user_id):
        """ユーザーIDに対応するチャネル名を取得"""
        return self.user_channels.get(user_id)
    
    def register_user(self, user_id):
        """ユーザーを登録する"""
        if user_id not in self.connected_users:
            self.connected_users.append(user_id)

    def get_user_count(self):
        """接続されているユーザーの数を返す"""
        return len(self.connected_users)

    def get_user_ids(self):
        """接続されているユーザーのIDリストを返す"""
        return self.connected_users

    def assign_paddle(self, user_id):
        """ユーザーにパドルを割り当てる。
        Args:
            user_id (int): パドルを割り当てるユーザーのID。
        """
        if 'paddle1' not in self.user_paddle_map.values():
            self.user_paddle_map[user_id] = 'paddle1'
        else:
            self.user_paddle_map[user_id] = 'paddle2'

    def get_paddle_for_user(self, user_id):
        """指定されたユーザーに割り当てられたパドルを取得する"""
        return self.user_paddle_map.get(user_id, None)


    def get_state(self):
        return self.pong_engine_data

    async def update_game(self, json_data):
        async with game_managers_lock:
            await self.pong_engine_update.update_game(json_data)
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

