from django.test import TestCase
from pong.online.pong_online_game_manager import PongOnlineGameManager
from asgiref.sync import async_to_sync

class TestPongOnlinePhysics(TestCase):
    def setUp(self):
        self.game_manager = PongOnlineGameManager(user_id=1)
        # await self.game_manager.initialize_game()
        async_to_sync(self.game_manager.initialize_game)()

    async def test_ball_collision_with_right_wall_increases_player1_score(self):
        # ボールが右壁に確実に触れるように設定
        ball_radius = self.game_manager.pong_engine_data["objects"]["ball"]["radius"]
        field_width = self.game_manager.pong_engine_data["game_settings"]["field"]["width"]
        self.game_manager.pong_engine_data["objects"]["ball"]["position"]["x"] = field_width / 2 - ball_radius

        # スコアを更新する前の状態を記録
        initial_score1 = self.game_manager.pong_engine_data["state"]["score1"]
        initial_score2 = self.game_manager.pong_engine_data["state"]["score2"]

        # ゲーム状態を更新
        await self.game_manager.update_game({"paddle1": {"dir_y": 0}, "paddle2": {"dir_y": 0}})

        # スコアが正しくプレイヤー1に対してインクリメントされているか確認
        self.assertEqual(self.game_manager.pong_engine_data["state"]["score1"], initial_score1 + 1, "Player 1's score should be incremented")

        # ボールが中心にリセットされているか確認
        # self.assertEqual(self.game_manager.pong_engine_data["objects"]["ball"]["position"]["x"], 0, "ボールは中心にリセットされるべき")



    async def test_ball_collision_with_ceiling_or_floor(self):
        # 天井にボールを移動させて衝突をシミュレート
        self.game_manager.pong_engine_data["objects"]["ball"]["position"]["y"] = self.game_manager.pong_engine_data["game_settings"]["field"]["height"] / 2
        await self.game_manager.update_game({"paddle1": {"dir_y": 0}, "paddle2": {"dir_y": 0}})
        
        # ボールの反射を確認
        self.assertNotEqual(
            self.game_manager.pong_engine_data["objects"]["ball"]["direction"]["y"],
            0,
            "天井との衝突判定"
        )

    async def test_adjust_ball_direction_and_speed(self):
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
