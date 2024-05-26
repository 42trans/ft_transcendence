# docker/srcs/uwsgi-django/pong/online/pong_online_config.py
class PongOnlineConfig:
    def __init__(self):
        self.fields = {
            "width": 400,
            "height": 300,
        }

        self.ball = {
            "radius": 5,
            "speed": 2,
            "direction": {"x": 1, "y": 0.1},
        }

        self.paddle1 = {
            "width": 10,
            # コーナーケーステスト時
            # "height": 290,
            # 正規
            "height": 30,
            "speed": 10,
            "dir_y": 0,
        }
        
        self.paddle2 = {
            "width": 10,
            # コーナーケーステスト時
            # "height": 290,
            # 正規
            "height": 30,
            "speed": 10,
            "dir_y": 0,
        }

        self.game_settings = {
            # テスト時
            "max_score": 1,
            # 正規
            # "max_score": 15,
            "init_ball_speed": 2,
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
