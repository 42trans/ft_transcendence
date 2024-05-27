# docker/srcs/uwsgi-django/pong/online/pong_online_update.py
from ...utils.async_logger import async_log
import asyncio
import random

class PongOnlineDuelUpdate:
    def __init__(self, consumer, game_manager, pong_engine_data, physics, match):
        self.consumer           = consumer
        self.game_manager       = game_manager
        self.physics            = physics
        self.match              = match
        self.pong_engine_data   = pong_engine_data

        # 得点時に間を空ける
        self.reset_interval     = 1
    
        self.ball       = pong_engine_data["objects"]["ball"]
        self.paddle1    = pong_engine_data["objects"]["paddle1"]
        self.paddle2    = pong_engine_data["objects"]["paddle2"]

        self.field              = pong_engine_data["game_settings"]["field"]
        self.difficulty         = pong_engine_data["game_settings"]["difficulty"]
        self.max_ball_speed     = pong_engine_data["game_settings"]["max_ball_speed"]
        self.init_ball_speed    = pong_engine_data["game_settings"]["init_ball_speed"]

    async def update_game(self, input_data):
        # await async_log(f"開始:update_game()  {input_data}")

        await self.handle_input(input_data)
        await self.handle_collisions()
        await self.update_ball_position()

    async def handle_input(self, input_data):
        """
        clienから受信したパドル情報を代入
        TODO_ft: クライアントとの通信がまだの間、開発用に一旦、Noneの回避目的でデフォルト0を入れている。値がない場合に0*speedで位置変更0な処理で良いか判断が必要。
        """
        self.paddle1["dir_y"] = input_data.get("paddle1", {}).get("dir_y", 0)
        self.paddle2["dir_y"] = input_data.get("paddle2", {}).get("dir_y", 0)
        self.paddle1["position"]["y"] = input_data.get("paddle1", {}).get("position", {}).get("y")
        self.paddle2["position"]["y"] = input_data.get("paddle2", {}).get("position", {}).get("y")

    async def handle_collisions(self):
        # await async_log("開始:handle_collisions()")
        r       = self.ball["radius"]
        ball_x  = self.ball["position"]["x"]
        ball_y  = self.ball["position"]["y"]

        if self.physics.is_colliding_with_side_walls(ball_x, r, self.field):
            scorer = 2 if ball_x < 0 else 1
            await self.reset_ball(scorer)
            # await async_log(f"scorer:  {scorer}")
            await self.match.update_score(scorer)

        if self.physics.is_colliding_with_ceiling_or_floor(ball_y, r, self.field):
            self.ball["direction"]["y"] = -self.ball["direction"]["y"]

        # paddle操作: 操作権限を持つユーザーのみ
        if self.game_manager.user_paddle_map.get(self.consumer.user_id) == 'paddle1':
            if self.physics.is_ball_colliding_with_paddle(self.ball, self.paddle1):
                self.physics.adjust_ball_direction_and_speed(self.ball, self.paddle1)
        if self.game_manager.user_paddle_map.get(self.consumer.user_id) == 'paddle2':
            if self.physics.is_ball_colliding_with_paddle(self.ball, self.paddle2):
                self.physics.adjust_ball_direction_and_speed(self.ball, self.paddle2)

    async def update_ball_position(self):
        self.ball["position"]["x"] += self.ball["direction"]["x"] * self.ball["speed"]
        self.ball["position"]["y"] += self.ball["direction"]["y"] * self.ball["speed"]

    async def reset_ball(self, loser):
        # 1秒間の遅延を挿入
        await asyncio.sleep(self.reset_interval)
        self.ball["position"] = {"x": 0, "y": 0}
        self.ball["direction"]["x"] = -1 if loser == 1 else 1
        # TODO_ft:ランダムにサーブ 3Dも実装する
        self.ball["direction"]["y"] = random.uniform(-0.5, 0.5)
        self.ball["speed"] = self.init_ball_speed
