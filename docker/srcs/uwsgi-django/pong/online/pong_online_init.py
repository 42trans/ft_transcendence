import logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

class PongOnlineInit:
    def __init__(self, config):
        self.config = config

    def init_pong_engine(self, data):
        self.init_settings(data)
        data["objects"] = {
            "ball": self.create_ball(),
            "paddle1": self.create_paddle(self.config.paddle1),
            "paddle2": self.create_paddle(self.config.paddle2)
        }
        self.setup_object_attributes(data["objects"])
        data["state"] = {
            "score1": 0,
            "score2": 0,
        }


    def init_settings(self, data):
        data["game_settings"] = {
            "max_score": self.config.game_settings["max_score"],
            "init_ball_speed": self.config.game_settings["init_ball_speed"],
            "max_ball_speed": self.config.cap_max_speed_to_avoid_tunneling(),
            "difficulty": self.config.game_settings["difficulty"],
            "field": {
                "width": self.config.fields["width"],
                "height": self.config.fields["height"]
            }
        }


    def create_ball(self):
        return {
            "radius": self.config.ball["radius"],
            "position": {"x": 0, "y": 0},
            "direction": self.config.ball["direction"],
        }

    def create_paddle(self, config):
        return {
            "width": config["width"],
            "height": config["height"],
            "speed": config["speed"],
            "dir_y": config["dir_y"],
            "position": {"x": 0, "y": 0}
        }


    def setup_object_attributes(self, objects):
        objects["ball"]["speed"] = self.config.ball["speed"]
        objects["ball"]["dir_x"] = self.config.ball["direction"]["x"]
        objects["ball"]["dir_y"] = self.config.ball["direction"]["y"]

        objects["paddle1"]["speed"] = self.config.paddle1["speed"]
        objects["paddle1"]["dir_y"] = self.config.paddle1["dir_y"]
        objects["paddle1"]["width"] = self.config.paddle1["width"]
        objects["paddle1"]["height"] = self.config.paddle1["height"]

        objects["paddle2"]["speed"] = self.config.paddle2["speed"]
        objects["paddle2"]["dir_y"] = self.config.paddle2["dir_y"]
        objects["paddle2"]["width"] = self.config.paddle2["width"]
        objects["paddle2"]["height"] = self.config.paddle2["height"]

