from django.test import TestCase
from pong.online.pong_online_game_manager import PongOnlineGameManager

class TestPongOnlinePhysics(TestCase):
    def setUp(self):
        self.game_manager = PongOnlineGameManager(user_id=1)
        self.game_manager.initialize_game()

    def test_ball_collision_with_walls(self):
        # 壁にボールを移動させて衝突をシミュレート
        self.game_manager.pong_engine_data["objects"]["ball"]["position"]["x"] = self.game_manager.pong_engine_data["game_settings"]["field"]["width"] / 2
        self.game_manager.update_game({"paddle1": {"dir_y": 0}, "paddle2": {"dir_y": 0}})
        
        # ボールの反射を確認
        self.assertNotEqual(
            self.game_manager.pong_engine_data["objects"]["ball"]["direction"]["x"],
            # self.game_manager.pong_engine_data["objects"]["ball"]["dir_x"],
            0,
            "壁との衝突判定"
        )

    def test_ball_collision_with_ceiling_or_floor(self):
        # 天井にボールを移動させて衝突をシミュレート
        self.game_manager.pong_engine_data["objects"]["ball"]["position"]["y"] = self.game_manager.pong_engine_data["game_settings"]["field"]["height"] / 2
        self.game_manager.update_game({"paddle1": {"dir_y": 0}, "paddle2": {"dir_y": 0}})
        
        # ボールの反射を確認
        self.assertNotEqual(
            self.game_manager.pong_engine_data["objects"]["ball"]["direction"]["y"],
            # self.game_manager.pong_engine_data["objects"]["ball"]["dir_y"],
            0,
            "天井との衝突判定"
        )

    def test_adjust_ball_direction_and_speed(self):
        ball = self.game_manager.pong_engine_data["objects"]["ball"]
        paddle = self.game_manager.pong_engine_data["objects"]["paddle1"]

        # パドルの位置を中央に設定
        paddle["position"]["x"] = 0
        paddle["position"]["y"] = 0

        # ボールをパドルの直前に設定し、左から右へ向かうようにする
        ball["position"]["x"] = -1  # パドルの左側に配置
        ball["position"]["y"] = 0
        ball["direction"]["x"] = 1  # 右向き
        initial_speed = ball["speed"]

        # 衝突処理を実行
        physics = self.game_manager.pong_engine_update.physics
        physics.adjust_ball_direction_and_speed(ball, paddle)

        # 速度と方向の確認
        self.assertTrue(
            ball["speed"] > initial_speed,
            "速度が増加べき"
        )
        self.assertEqual(
            ball["direction"]["x"], -1,
            "X方向が反転すべき"
        )

    def test_ball_collision_with_paddle(self):
        # パドルの位置を設定
        paddle_position = self.game_manager.pong_engine_data["objects"]["paddle1"]["position"]
        paddle_position["x"] = 0  # パドルを中央に設定
        paddle_position["y"] = 0  # Yも中央に設定（テストの明確化）
        
        # ボールをパドルの直前に設定して、左から右へ移動するようにする
        self.game_manager.pong_engine_data["objects"]["ball"]["position"]["x"] = -1
        self.game_manager.pong_engine_data["objects"]["ball"]["position"]["y"] = 0
        self.game_manager.pong_engine_data["objects"]["ball"]["direction"]["x"] = 1
        initial_speed = self.game_manager.pong_engine_data["objects"]["ball"]["speed"]

        # 衝突の前にボールを更新
        self.game_manager.update_game({"paddle1": {"dir_y": 0}, "paddle2": {"dir_y": 0}})

        self.assertTrue(
            self.game_manager.pong_engine_data["objects"]["ball"]["speed"] > initial_speed,
            "速度が増加べき"
        )
        self.assertEqual(
            self.game_manager.pong_engine_data["objects"]["ball"]["direction"]["x"], -1,
            "X方向が反転べき"
        )
