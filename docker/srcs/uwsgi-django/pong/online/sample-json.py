{
    "game_settings": {
        "max_score": 15,
        "init_ball_speed": 2,
        "max_ball_speed": 9.9,
        "difficulty": 0.5,
        "field": {
            "width": 400,
            "height": 300
        }
    },
    "objects": {
        "ball": {
            "radius": 5,
            "speed": 2,
            "position": {"x": 0, "y": 0},
            "direction": {"x": 1, "y": 0.1},
        },
        "paddle1": {
            "speed": 10,
            "dir_y": 0,
            "width": 10,
            "height": 30,
            "position": {"x": -140.0, "y": 0}
        },
        "paddle2": {
            "speed": 10,
            "dir_y": 0,
            "width": 10,
            "height": 30,
            "position": {"x": 140.0, "y": 0}
        }
    },
    "state": {"score1": 0, "score2": 0},
    "is_running": True
}