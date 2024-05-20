# 初期化、再接続、スコア変更時 aciton
{
	"action": "*******",
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
# 高頻度の更新
{
    "action": "update",
    "objects": {
        "ball": {
            "position": {"x": 10, "y": 15},
            "direction": {"x": 1, "y": 0.1}
        },
        "paddle1": {
            "position": {"x": -140.0, "y": 20},
            "dir_y": 0,
        },
        "paddle2": {
            "position": {"x": 140.0, "y": 25},
            "dir_y": 0,
        }
    },
    "state": {
        "score1": 1,
        "score2": 0
    },
    "is_running": True
}
