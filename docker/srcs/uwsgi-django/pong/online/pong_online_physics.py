# docker/srcs/uwsgi-django/pong/online/pong_online_physics.py
class PongOnlinePhysics:
    def __init__(self, pong_engine_data):
        self.max_ball_speed = pong_engine_data["game_settings"]["max_ball_speed"]
        self.ball_speed     = pong_engine_data["game_settings"]["init_ball_speed"]
        self.ball_direction = pong_engine_data["objects"]["ball"]["direction"]
        self.paddle1_speed  = pong_engine_data["objects"]["paddle1"]["speed"]
        self.paddle2_speed  = pong_engine_data["objects"]["paddle2"]["speed"]

    def is_colliding_with_side_walls(self, ball_x, r, field):
        """ 衝突判定: 水平・横方向の壁 """
        return ball_x - r <= -field["width"] / 2 or ball_x + r >= field["width"] / 2

    def is_colliding_with_ceiling_or_floor(self, ball_y, r, field):
        """ 衝突判定: 垂直・縦方向の天井 """
        return ball_y - r <= -field["height"] / 2 or ball_y + r >= field["height"] / 2

    def is_ball_colliding_with_paddle(self, ball, paddle):
        """ 衝突判定: ボールとパドル """
        r           = ball["radius"]
        ball_x      = ball["position"]["x"]
        ball_y      = ball["position"]["y"]
        paddle_x    = paddle["position"]["x"]
        paddle_y    = paddle["position"]["y"]

        return ball_x + r >= paddle_x - paddle["width"] / 2 and \
               ball_x - r <= paddle_x + paddle["width"] / 2 and \
               ball_y + r >= paddle_y - paddle["height"] / 2 and \
               ball_y - r <= paddle_y + paddle["height"] / 2


    def adjust_ball_direction_and_speed(self, ball, paddle):
        """
        (衝突判定後)ボールのスピードと方向を変える
        - 上記のis_ball_colliding_with_paddle()とセットで使用する
        """
        ball_x      = ball["position"]["x"]
        paddle_x    = paddle["position"]["x"]
        
        # ボールがパドルに向かって進んでいるかどうかを判定する条件
        is_ball_closing_in_paddl: bool = (
            (ball["direction"]["x"] < 0 and ball_x > paddle_x) or 
            (ball["direction"]["x"] > 0 and ball_x < paddle_x)
        )
        # 上記がtrueなら
        if is_ball_closing_in_paddl:
            # ボールの水平方向を反転
            ball["direction"]["x"] = -ball["direction"]["x"]
            # パドルの移動方向でボールに影響を与える
            ball["direction"]["y"] += paddle["dir_y"] * 0.05
            # 速度を10%増加させる。最大速度を超えないように制限
            ball["speed"] = min(ball["speed"] * 1.1, self.max_ball_speed)

