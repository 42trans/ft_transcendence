from .pong_online_config import PongOnlineConfig
from .pong_online_init import PongOnlineInit
from .pong_online_update import PongOnlineUpdate
from .pong_online_physics import PongOnlinePhysics
from .pong_online_match import PongOnlineMatch
import logging
from typing import Dict, Any

logger = logging.getLogger('Pong online')

class PongOnlineGameManager:
    def __init__(self, user_id):
        self.user_id = user_id
        self.config = PongOnlineConfig()
        self.pong_engine_data: Dict[str, Any] = {
            "objects": {},
            "game_settings": {},
            "state": {"score1": 0, "score2": 0},
            "is_running": True
        }
        self.pong_engine_init = PongOnlineInit(self.config)
        self.pong_engine_update = None
        self.match = None
        self.initialize_game()


    def initialize_game(self):
        self.pong_engine_init.init_pong_engine(self.pong_engine_data)
        self.match = PongOnlineMatch(self.pong_engine_data)
        self.pong_engine_update = PongOnlineUpdate(
            self.pong_engine_data,
            PongOnlinePhysics(self.pong_engine_data),
            self.match
        )


    def update_game(self, json_data):
        self.pong_engine_update.update_game(json_data)
        return self.pong_engine_update.serialize_state()
    