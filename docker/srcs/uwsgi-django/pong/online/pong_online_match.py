# docker/srcs/uwsgi-django/pong/online/pong_online_match.py
class PongOnlineMatch:
    def __init__(self, pong_engine):
        self.pong_engine = pong_engine
        self.score1 = pong_engine["state"]["score1"]
        self.score2 = pong_engine["state"]["score2"]
        self.max_score = pong_engine["game_settings"]["max_score"]
        self.match_data = pong_engine.get("match_data", {})
        self.env = pong_engine.get("env", {})

    def update_score(self, scorer):
        if scorer == 1:
            self.score1 += 1
        else:
            self.score2 += 1
        self.check_match_end()

    def check_match_end(self):
        if self.score1 >= self.max_score or self.score2 >= self.max_score:
            self.end_game()

    def end_game(self):
        self.pong_engine["is_running"] = False
