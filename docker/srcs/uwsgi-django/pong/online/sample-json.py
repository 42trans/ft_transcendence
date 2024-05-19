{
    "game_settings": {
        "max_score": 10,
        "init_ball_speed": 1.0,
        "max_ball_speed": 2.5,
        "difficulty": "medium",
        "field": {
            "width": 400,
            "height": 300
        }
    },
    "objects": {
        "ball": {
            "radius": 10,
            "speed": 1.0,
            "position": {
                "x": 0,
                "y": 0
            },
            "direction": 45
        },
        "paddle1": {
            "speed": 2.0,
            "dir_y": 0,
            "width": 10,
            "height": 100,
            "position": {
                "x": -375,
                "y": 0
            }
        },
        "paddle2": {
            "speed": 2.0,
            "dir_y": 0,
            "width": 10,
            "height": 100,
            "position": {
                "x": 375,
                "y": 0
            }
        }
    },
    "state": {
        "score1": 0,
        "score2": 0
    },
	"is_running": True
}
