import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

class PongOnlineInit:
    """
    # 例外処理: 呼び出し元の PongOnlineGameManager でキャッチする
    - 単純なデータ操作であり、外部リソースへのアクセスやユーザー入力への依存がないため
    - 例外は、ゲームの設定ファイル (self.config) の内容が不正である場合のため
    """
    def __init__(self, config):
        self.config = config

    def init_pong_engine(self):
        data = {
            "game_settings": {
                "max_score": self.config.game_settings["max_score"],
                "init_ball_speed": self.config.game_settings["init_ball_speed"],
                "max_ball_speed": self.config.cap_max_speed_to_avoid_tunneling(),
                "difficulty": self.config.game_settings["difficulty"],
                "field": {
                    "width": self.config.fields["width"],
                    "height": self.config.fields["height"]
                }
            },
            "objects":  {
                "ball": {
                    "radius": self.config.ball["radius"],
                    "speed": self.config.ball["speed"],
                    "position": {"x": 0, "y": 0},
                    "direction": self.config.ball["direction"],
                },
                "paddle1": self.create_paddle(self.config.paddle1, is_paddle1=True),
                "paddle2": self.create_paddle(self.config.paddle2, is_paddle1=False)
            },
            "state": {
                "score1": 0,
                "score2": 0,
            },
            "is_running": True
        }
        return data

    def create_paddle(self, config, is_paddle1):
        if is_paddle1:
            x_position = -(self.config.fields["width"] * 0.95) / 2 + 50
        else:
            x_position = (self.config.fields["width"] * 0.95) / 2 - 50

        return {
            "speed": config["speed"],
            "dir_y": config["dir_y"],
            "width": config["width"],
            "height": config["height"],
            "position": {"x": x_position, "y": 0}
        }

