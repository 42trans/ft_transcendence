# docker/srcs/uwsgi-django/pong/online/pong_online_config.py

TEST_MAX_PADDLE_HEIGHT = 0
TEST_END_GAME = 1

class PongOnlineConfig:
    def __init__(self):
        if TEST_END_GAME:
            # テスト時
            ball_speed  = 9
            max_score   = 1
        else:
            ball_speed = 3
            max_score   = 15
        
        if TEST_MAX_PADDLE_HEIGHT:
            paddle_height = 300
        else:
            paddle_height = 30


        self.fields = {
            "width": 400,
            "height": 300,
        }

        self.ball = {
            "radius": 5,
            "speed": ball_speed,
            "direction": {"x": 1, "y": 0.1},
        }

        self.paddle1 = {
            "width": 10,
            "height": paddle_height,
            "speed": 10,
            "dir_y": 0,
        }
        
        self.paddle2 = {
            "width": 10,
            "height": paddle_height,
            "speed": 10,
            "dir_y": 0,
        }

        self.game_settings = {
            "max_score": max_score,
            "init_ball_speed": 3,
            "max_ball_speed": 10,
            "absolute_max_speed": 9.9,
            "difficulty": 0.5,
        }

    def cap_max_speed_to_avoid_tunneling(self):
        return min(
            self.paddle1["width"] * 0.99,
            self.paddle2["width"] * 0.99,
            self.game_settings["absolute_max_speed"]
        )
