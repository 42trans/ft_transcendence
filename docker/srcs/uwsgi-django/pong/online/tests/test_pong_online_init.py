from django.test import TestCase, SimpleTestCase
from asgiref.sync import async_to_sync
from pong.online.pong_online_config import PongOnlineConfig
from pong.online.pong_online_game_manager import PongOnlineGameManager
from channels.testing import WebsocketCommunicator
from pong.online.pong_online_consumer import PongOnlineConsumer
import asyncio
from django.test import override_settings


@override_settings(SECURE_SSL_REDIRECT=False)
class TestPongOnlineInit(TestCase):
    def setUp(self):
        # asyncSetUp を同期的に呼び出す
        asyncio.run(self.asyncSetUp())

    async def asyncSetUp(self):  
        self.config = PongOnlineConfig()
        self.game_manager = PongOnlineGameManager(user_id=1, consumer=None)
        await self.game_manager.initialize_game() 


    def test_initial_state(self):
        """ 
        configから受け取った直後の.jsonの初期状態のテスト
        - JSONオブジェクトの、値、順序、構造の厳密な比較
        ※ この内容がクライアントの初期状態にもなる実装の予定です。
        ※ テスト時は比較対象のpong_online_config.pyの内容と数値を合わせてください
        """
        initial_state	= self.game_manager.pong_engine_data
        expected_state = {
            "game_settings": {
                "max_score": self.config.game_settings["max_score"],
                "init_ball_speed": self.config.game_settings["init_ball_speed"],
                "max_ball_speed": 9.9,
                "difficulty": 0.5,
                "field": {
                    "width": 400,
                    "height": 300
                }
            },
            "objects": {
                "ball": {
                    "radius": 5,
                    "speed": self.config.ball["speed"],
                    "position": {"x": 0, "y": 0},
                    "direction": {"x": 1, "y": 0.1},
                },
                "paddle1": {
                    "speed": 10,
                    "dir_y": 0,
                    "width": 10,
                    "height": self.config.paddle1["height"],
                    "position": {"x": -140.0, "y": 0}
                },
                "paddle2": {
                    "speed": 10,
                    "dir_y": 0,
                    "width": 10,
                    "height": self.config.paddle2["height"],
                    "position": {"x": 140.0, "y": 0}
                }
            },
            "state": {"score1": 0, "score2": 0},
            "is_running": True
        }
        self.assertEqual(initial_state, expected_state)
