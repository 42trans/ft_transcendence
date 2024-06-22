# docker/srcs/uwsgi-django/pong/online/pong_online_physics.py
class PongOnlinePhysics:
    """
    # 例外処理: 呼び出し元の PongOnlineUpdater > PongOnlineGameManager でキャッチする
    - 単純な計算処理が中心であり、外部リソースへのアクセスやユーザー入力への依存がないため
    - ゼロ除算はない ( /2 の処理のみ) 
    - オーバーフローはない: 座標や速度の範囲が制限されている
    """

    def __init__(self, pong_engine_data):
        self.max_ball_speed = pong_engine_data["game_settings"]["max_ball_speed"]
        self.ball_speed     = pong_engine_data["game_settings"]["init_ball_speed"]
        self.ball_direction = pong_engine_data["objects"]["ball"]["direction"]
        self.paddle1_speed  = pong_engine_data["objects"]["paddle1"]["speed"]
        self.paddle2_speed  = pong_engine_data["objects"]["paddle2"]["speed"]

    def is_colliding_with_side_walls(self, ball_x, r, field):
        """ 
        衝突判定: 水平・横方向の壁
        - x 座標: 左側が負の値、右側が正の値 
        """
        return (
            ball_x - r <= -field["width"] / 2 or 
            ball_x + r >= field["width"] / 2
        )

    def is_colliding_with_top_or_bottom_wall(self, ball_y, r, field):
        """ 
        衝突判定: 垂直・縦方向の壁 
        - y 座標: 上側が負の値、下側が正の値
        """
        return (
            # ボールの中心座標 ball_y が = -145(field.height/2) 以下であれば上部の壁と衝突
            # ex. -145 - 5 <= - 300/2
            ball_y - r <= -field["height"] / 2 or 
            # ボールの中心座標 ball_y が 145 以上であれば下部の壁と衝突
            # ex. 145 + 5 >= 300/2
            ball_y + r >= field["height"] / 2
        )

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
            # 左のパドルに当たった場合 +1, 右のパドルに当たった場合 -1
            ball["direction"]["x"] = -ball["direction"]["x"]
            # パドルの移動方向でボールに影響を与える
            ball["direction"]["y"] += paddle["dir_y"] * 0.05
            # ボール位置をパドルの表面に合わせる
            # ball["direction"]["x"]: 数行上のコードで逆方向に転換済み。左のパドルに当たった場合は +1
            # 左のパドルの場合、ボールはパドルの右にずらすため、パドル中心座標にパドルの厚みとボールの半径を追加する。
            # どちらの場合でも、paddle x 座標より、絶対値で10小さい値（中央0,0に近づく）になる
            # ex. +1 * (5 + 10/2) + -140 = -130 
            ball["position"]["x"] = ball["direction"]["x"] * (ball["radius"] + paddle["width"] / 2) + paddle_x
            # 速度を10%増加させる。最大速度を超えないように制限
            ball["speed"] = min(ball["speed"] * 1.1, self.max_ball_speed)


