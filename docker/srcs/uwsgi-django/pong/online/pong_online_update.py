# docker/srcs/uwsgi-django/pong/online/pong_online_update.py
from ..utils.async_logger import async_log

class PongOnlineUpdate:
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

    async def update_game(self, input_data):
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
        r       = self.ball["radius"]
        ball_x  = self.ball["position"]["x"]
        ball_y  = self.ball["position"]["y"]

        if self.physics.is_colliding_with_side_walls(ball_x, r, self.field):
            scorer = 2 if ball_x < 0 else 1
            self.reset_ball(scorer)
            # await async_log(f"a scorer:  {scorer}")
            await self.match.update_score(scorer)

        if self.physics.is_colliding_with_ceiling_or_floor(ball_y, r, self.field):
            self.ball["direction"]["y"] = -self.ball["direction"]["y"]

        if self.physics.is_ball_colliding_with_paddle(self.ball, self.paddle1):
            self.physics.adjust_ball_direction_and_speed(self.ball, self.paddle1)
        if self.physics.is_ball_colliding_with_paddle(self.ball, self.paddle2):
            self.physics.adjust_ball_direction_and_speed(self.ball, self.paddle2)

    async def update_ball_position(self):
        self.ball["position"]["x"] += self.ball["direction"]["x"] * self.ball["speed"]
        self.ball["position"]["y"] += self.ball["direction"]["y"] * self.ball["speed"]

    def reset_ball(self, loser):
        self.ball["position"] = {"x": 0, "y": 0}
        self.ball["direction"]["x"] = -1 if loser == 1 else 1
        self.ball["direction"]["y"] = 0.1
        self.ball["speed"] = self.init_ball_speed

    def serialize_state(self):
        return {
            "objects": {
                "ball": {
                    "position": self.ball["position"],
                    "direction": self.ball["direction"],
                    "speed": self.ball["speed"]
                },
                "paddle1": {
                    "position": self.paddle1["position"],
                    "dir_y": self.paddle1["dir_y"]
                },
                "paddle2": {
                    "position": self.paddle2["position"],
                    "dir_y": self.paddle2["dir_y"]
                }
            },
            "state": {
                "score1": self.pong_engine_data["state"]["score1"],
                "score2": self.pong_engine_data["state"]["score2"]
            },
            "is_running": self.pong_engine_data["is_running"]
        }
