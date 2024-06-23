# docker/srcs/uwsgi-django/pong/online/pong_online_match.py
from ..utils.async_logger import async_log
from .pong_online_consumer_util import PongOnlineConsumerUtil

# asyn_log: docker/srcs/uwsgi-django/pong/utils/async_log.log
DEBUG_FLOW = 0
DEBUG_DETAIL = 0

class PongOnlineMatch:
    """
    # 例外処理: 呼び出し元の PongOnlineUpdater > PongOnlineGameManager でキャッチする
    - 単純な計算処理が中心であり、外部リソースへのアクセスやユーザー入力への依存がないため
    - 全て game_state (ゲームの状態を保持する辞書)に対する処理
    """
    def __init__(self, consumer, game_state):
        self.consumer     = consumer
        self.game_state   = game_state

    async def update_score(self, scorer):
        if scorer == 1:
            self.game_state["state"]["score1"] += 1
        else:
            self.game_state["state"]["score2"] += 1
        if DEBUG_DETAIL:
            await async_log(f"score1: {self.game_state['state']['score1']}")
            await async_log(f"score2: {self.game_state['state']['score2']}")

        if self.is_match_end():
            await self.end_game()


    def is_match_end(self):
        return (
            self.game_state["state"]["score1"] >= self.game_state["game_settings"]["max_score"] or 
            self.game_state["state"]["score2"] >= self.game_state["game_settings"]["max_score"]
        )


    async def end_game(self):
        self.game_state["is_running"] = False
        if self.game_state["state"]["score1"] > self.game_state["state"]["score2"]:
            winner = 1
        else:
            winner = 2
        if DEBUG_DETAIL:
            await async_log(f"Game ended.Winner: Player {winner}")
            await async_log(f"is_running: {self.game_state["is_running"]}")
        
        await PongOnlineConsumerUtil.broadcast_game_end(self.consumer, winner, self.game_state)

        await self.consumer.disconnect(None)
        if DEBUG_FLOW:
            await async_log(f"consumer.disconnect()")
