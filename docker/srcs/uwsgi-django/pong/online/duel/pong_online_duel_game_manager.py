from ..pong_online_config import PongOnlineConfig
from ..pong_online_init import PongOnlineInit
from ..pong_online_update import PongOnlineUpdate
from ..pong_online_physics import PongOnlinePhysics
from ..pong_online_match import PongOnlineMatch
import logging
from typing import Dict, Any
from ...utils.async_logger import async_log

logger = logging.getLogger(__name__)

class PongOnlineDuelGameManager:
    def __init__(self):
    # def __init__(self, user_id):
        # self.user_id = user_id
        self.config = PongOnlineConfig()
        self.pong_engine_data: Dict[str, Any] = {
            "objects": {},
            "game_settings": {},
            "state": {},
            "is_running": None
        }
        self.match = None
        self.physics = None
        self.pong_engine_update = None

    async def initialize_game(self):
        init                    = PongOnlineInit(self.config)
        self.pong_engine_data   = init.init_pong_engine()
        self.match              = PongOnlineMatch(self.pong_engine_data)
        self.physics            = PongOnlinePhysics(self.pong_engine_data)
        self.pong_engine_update = PongOnlineUpdate(
            self.pong_engine_data,
            self.physics,
            self.match
        )
        # await async_log("initialize_game().pong_engine_data: ")
        # await async_log(self.pong_engine_data)
        return self


    async def update_game(self, json_data):
        await self.pong_engine_update.update_game(json_data)
        return self


    async def restore_game_state(self, client_json_state):
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
        # ログ出力
        # await async_log("Game state restored from client.")
        return self

