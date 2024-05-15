# docker/srcs/uwsgi-django/pong/online/pong_online_physics.py
class PongOnlinePhysics:
    def __init__(self, pong_engine_data):
        self.max_ball_speed = pong_engine_data["game_settings"]["max_ball_speed"]
        self.ball_speed = pong_engine_data["game_settings"]["init_ball_speed"]
        self.ball_direction = pong_engine_data["objects"]["ball"]["direction"]
        self.paddle1_speed = pong_engine_data["objects"]["paddle1"]["speed"]
        self.paddle2_speed = pong_engine_data["objects"]["paddle2"]["speed"]

    def is_colliding_with_side_walls(self, ball_x, r, field):
        return ball_x - r <= -field["width"] / 2 or ball_x + r >= field["width"] / 2

    def is_colliding_with_ceiling_or_floor(self, ball_y, r, field):
        return ball_y - r <= -field["height"] / 2 or ball_y + r >= field["height"] / 2

    def is_ball_colliding_with_paddle(self, ball, paddle):
        r = ball["radius"]
        ball_x = ball["position"]["x"]
        ball_y = ball["position"]["y"]
        paddle_x = paddle["position"]["x"]
        paddle_y = paddle["position"]["y"]

        return ball_x + r >= paddle_x - paddle["width"] / 2 and \
               ball_x - r <= paddle_x + paddle["width"] / 2 and \
               ball_y + r >= paddle_y - paddle["height"] / 2 and \
               ball_y - r <= paddle_y + paddle["height"] / 2


    def adjust_ball_direction_and_speed(self, ball, paddle):
        ball_x = ball["position"]["x"]
        paddle_x = paddle["position"]["x"]

        # initial_speed = ball["speed"]
        # print(f"Before adjustment: Ball speed: {ball['speed']}, dir_x: {ball['dir_x']}")

        # ボールがパドルに向かって進んでいるかどうかを判定
        if ((ball["direction"]["x"] < 0 and ball_x > paddle_x) or 
            (ball["direction"]["x"] > 0 and ball_x < paddle_x)):
        # if ((ball["dir_x"] < 0 and ball_x > paddle_x) or (ball["dir_x"] > 0 and ball_x < paddle_x)):
            ball["direction"]["x"] = -ball["direction"]["x"]  # ボールの水平方向を反転
            ball["direction"]["y"] += paddle["dir_y"] * 0.05  # パドルの移動方向がボールに影響
            # ball["dir_x"] = -ball["dir_x"]  # ボールの水平方向を反転
            # ball["dir_y"] += paddle["dir_y"] * 0.05  # パドルの移動方向がボールに影響
            ball["speed"] = min(ball["speed"] * 1.1, self.max_ball_speed)  # 速度を10%増加させ、最大速度を超えないように制限

        # print(f"After adjustment: Ball speed: {ball['speed']}, dir_x: {ball['dir_x']}, Increased by: {ball['speed'] - initial_speed}")

