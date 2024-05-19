from django.test import TestCase
from pong.online.pong_online_game_manager import PongOnlineGameManager

class TestPongOnlineUpdate(TestCase):
    def setUp(self):
        self.game_manager = PongOnlineGameManager(user_id=1)
        self.game_manager.initialize_game()

    def test_paddle_movement_input(self):
        initial_y = self.game_manager.pong_engine_data["objects"]["paddle1"]["position"]["y"]
        self.game_manager.update_game({"paddle1": {"dir_y": 10}, "paddle2": {"dir_y": -10}})
        updated_y = self.game_manager.pong_engine_data["objects"]["paddle1"]["position"]["y"]
        
        self.assertNotEqual(
            initial_y, 
            updated_y, 
            "パドルのY座標が更新されるべき"
        )
    
