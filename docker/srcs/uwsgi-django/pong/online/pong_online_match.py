# docker/srcs/uwsgi-django/pong/online/pong_online_match.py
from ..utils.async_logger import async_log

class PongOnlineMatch:
    def __init__(self, pong_engine_data):
        self.pong_engine_data   = pong_engine_data
        # self.match_data         = pong_engine_data.get("match_data", {})
        # self.env                = pong_engine_data.get("env", {})

    async def update_score(self, scorer):
        if scorer == 1:
            self.pong_engine_data["state"]["score1"] += 1
        else:
            self.pong_engine_data["state"]["score2"] += 1

        await async_log(f"score1: {self.pong_engine_data['state']['score1']}")
        await async_log(f"score2: {self.pong_engine_data['state']['score2']}")
        self.check_match_end()

    def check_match_end(self):
        if (self.pong_engine_data["state"]["score1"] >= self.pong_engine_data["game_settings"]["max_score"] or 
            self.pong_engine_data["state"]["score2"] >= self.pong_engine_data["game_settings"]["max_score"]):
            self.end_game()

    def end_game(self):
        self.pong_engine_data["is_running"] = False

        # TODO_ft:他のupdate()メソッドなどと合わせて終了処理を考える
        #           - clientへのゲーム終了フラグ、winner送信など
