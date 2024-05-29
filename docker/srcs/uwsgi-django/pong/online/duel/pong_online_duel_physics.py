# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_physics.py

class PongOnlineDuelPhysics:
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


    def adjust_ball_direction_and_speed(self, ball, paddle):
    # async def adjust_ball_direction_and_speed(self, ball, paddle):
        """
        (衝突判定後)ボールのスピードと方向を変える
        - is_ball_colliding_with_paddle()とセットで使用する
        """
        ball_x      = ball["position"]["x"]
        paddle_x    = paddle["position"]["x"]
        ball_radius = ball["radius"]
        # paddle_x = paddle["position"]["x"]
        paddle_half_width = paddle["width"] / 2
        
        is_ball_closing_in_paddl: bool = (
            (ball["direction"]["x"] < 0 and ball_x - ball_radius > paddle_x - paddle_half_width) or 
            (ball["direction"]["x"] > 0 and ball_x + ball_radius < paddle_x + paddle_half_width)
        )
        # 上記がtrueなら
        if is_ball_closing_in_paddl:
            # 左方向に移動している場合　パドル表面に移動する
            if ball["direction"]["x"] < 0:  
                ball["position"]["x"] = paddle["position"]["x"] + paddle["width"] / 2 + ball_radius
            else:  # 右方向に移動している場合
                ball["position"]["x"] = paddle["position"]["x"] - paddle["width"] / 2 - ball_radius

            # ボールの水平方向を反転
            ball["direction"]["x"] = -ball["direction"]["x"]
            # パドルの移動方向でボールに影響を与える
            ball["direction"]["y"] += paddle["dir_y"] * 0.05
            # 速度を10%増加させる。最大速度を超えないように制限
            ball["speed"] = min(ball["speed"] * 1.1, self.max_ball_speed)

    def is_ball_colliding_with_paddle_current(self, ball, paddle):
        """衝突判定: ボールの現在位置に基づいてパドルとの衝突を判定する"""
        r = ball["radius"]
        ball_x = ball["position"]["x"]
        ball_y = ball["position"]["y"]
        paddle_x = paddle["position"]["x"]
        paddle_y = paddle["position"]["y"]
        paddle_width = paddle["width"]
        paddle_height = paddle["height"]

        # パドルの端点を計算
        paddle_left = paddle_x - paddle_width / 2
        paddle_right = paddle_x + paddle_width / 2
        paddle_top = paddle_y - paddle_height / 2
        paddle_bottom = paddle_y + paddle_height / 2

        if (ball_x + r >= paddle_left) and (ball_x - r <= paddle_right):
            if (ball_y + r >= paddle_top) and (ball_y - r <= paddle_bottom):
                return True
        return False


    def is_ball_colliding_with_paddle(self, ball, paddle):
        if self.is_ball_colliding_with_paddle_current(ball, paddle):
            return True
        else:
            return False