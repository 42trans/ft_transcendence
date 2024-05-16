from django.test import TestCase
from pong.online.pong_online_game_manager import PongOnlineGameManager

class TestPongOnlineGameManager(TestCase):
    def setUp(self):
        self.game_manager = PongOnlineGameManager(user_id=1)

    def test_initialize_game(self):
        # ゲームデータの各主要セクションが存在するか
        self.assertIn("objects", self.game_manager.pong_engine_data)
        self.assertIn("game_settings", self.game_manager.pong_engine_data)
        self.assertIn("state", self.game_manager.pong_engine_data)
        
        # ゲームのスコアが0
        self.assertEqual(self.game_manager.pong_engine_data["state"]["score1"], 0)
        self.assertEqual(self.game_manager.pong_engine_data["state"]["score2"], 0)
        
        self.assertEqual(
            self.game_manager.pong_engine_data["game_settings"]["max_score"],
            self.game_manager.config.game_settings["max_score"]
        )
        self.assertEqual(
            self.game_manager.pong_engine_data["game_settings"]["init_ball_speed"],
            self.game_manager.config.game_settings["init_ball_speed"]
        )
        self.assertEqual(
            self.game_manager.pong_engine_data["game_settings"]["max_ball_speed"],
            self.game_manager.config.cap_max_speed_to_avoid_tunneling()
        )
        self.assertEqual(
            self.game_manager.pong_engine_data["game_settings"]["difficulty"],
            self.game_manager.config.game_settings["difficulty"]
        )
