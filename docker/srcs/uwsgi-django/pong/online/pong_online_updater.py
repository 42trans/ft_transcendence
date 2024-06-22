# docker/srcs/uwsgi-django/pong/online/pong_online_updater.py
from ..utils.async_logger import async_log
import asyncio
import random

# asyn_log: docker/srcs/uwsgi-django/pong/utils/async_log.log
DEBUG_FLOW = 1
DEBUG_DETAIL = 0

class PongOnlineUpdater:
    """
    # 例外処理: 呼び出し元の PongOnlineGameManager でキャッチする
    - 単純な計算処理が中心であり、外部リソースへのアクセスやユーザー入力への依存がないため
    """
    def __init__(self, pong_engine_data, physics, match):
        self.physics            = physics
        self.match              = match
        self.pong_engine_data   = pong_engine_data

        self.ball       = pong_engine_data["objects"]["ball"]
        self.paddle1    = pong_engine_data["objects"]["paddle1"]
        self.paddle2    = pong_engine_data["objects"]["paddle2"]

        self.field              = pong_engine_data["game_settings"]["field"]
        self.difficulty         = pong_engine_data["game_settings"]["difficulty"]
        self.max_ball_speed     = pong_engine_data["game_settings"]["max_ball_speed"]
        self.init_ball_speed    = pong_engine_data["game_settings"]["init_ball_speed"]

        # 得点時に間を空ける時間（秒）
        self.reset_interval     = 1
        # y位置の最大値と最小値を事前に計算
        self.max_y = self.field["height"] / 2 - self.ball["radius"]
        self.min_y = -self.field["height"] / 2 + self.ball["radius"]


    async def update_game(self, json_game_state_objects):
        if DEBUG_DETAIL:
            await async_log(f"開始: update_game: {json_game_state_objects}")
        await self.handle_input(json_game_state_objects)
        await self.handle_collisions()
        await self.update_ball_position()


    async def handle_input(self, json_game_state_objects):
        """
        clienから受信したパドル情報を代入
        """
        paddle1_data = json_game_state_objects["paddle1"]
        paddle2_data = json_game_state_objects["paddle2"]
        self.paddle1["dir_y"] = paddle1_data["dir_y"]
        self.paddle2["dir_y"] = paddle2_data["dir_y"]
        self.paddle1["position"]["y"] = paddle1_data["position"]["y"]
        self.paddle2["position"]["y"] = paddle2_data["position"]["y"]


    async def handle_collisions(self):
        r       = self.ball["radius"]
        ball_x  = self.ball["position"]["x"]
        ball_y  = self.ball["position"]["y"]

        if self.physics.is_colliding_with_side_walls(ball_x, r, self.field):
            scorer = 2 if ball_x < 0 else 1
            await self.reset_ball(scorer)
            await self.match.update_score(scorer)

        if self.physics.is_colliding_with_top_or_bottom_wall(ball_y, r, self.field):
            self.ball["direction"]["y"] = -self.ball["direction"]["y"]

        # それぞれのパドルで判定
        if self.physics.is_ball_colliding_with_paddle(self.ball, self.paddle1):
            self.physics.adjust_ball_direction_and_speed(self.ball, self.paddle1)
        if self.physics.is_ball_colliding_with_paddle(self.ball, self.paddle2):
            self.physics.adjust_ball_direction_and_speed(self.ball, self.paddle2)


    async def update_ball_position(self):
        self.ball["position"]["x"] += self.ball["direction"]["x"] * self.ball["speed"]
        self.ball["position"]["y"] += self.ball["direction"]["y"] * self.ball["speed"]
        # # y位置の最大値と最小値を制限
        self.ball["position"]["y"] = max(self.min_y, min(self.max_y, self.ball["position"]["y"]))


    async def reset_ball(self, loser):
        """
        - ballを中央に移動
        - 得点された側にサーブ
        - 1秒間の遅延を挿入
        - random方向にボールサーブ
        """
        await asyncio.sleep(self.reset_interval)
        self.ball["position"]       = {"x": 0, "y": 0}
        self.ball["direction"]["x"] = -1 if loser == 1 else 1
        self.ball["direction"]["y"] = random.uniform(-0.5, 0.5)
        self.ball["speed"]          = self.init_ball_speed


#  (-200, 150) +-------------------+ (200, 150)
#              |                   |
#              |                   |
#              |                   |
#              |        0,0        |
#              |                   |
#              |                   |
#              |                   |
#  (-200,-150) +-------------------+ (200,-150)
