# docker/srcs/uwsgi-django/pong/online/pong_online_match.py
from ..utils.async_logger import async_log

# asyn_log: docker/srcs/uwsgi-django/pong/utils/async_log.log
DEBUG_FLOW = 1
DEBUG_DETAIL = 0

class PongOnlineMatch:
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
        
        await self.consumer.channel_layer.group_send(self.consumer.room_group_name, {
            "type": "send_event_to_client",  
            "event_type": "game_end",
            "event_data": {
                "winner": winner,
                'end_game_state': self.game_state
            }
        })
        await self.consumer.disconnect(None)
        if DEBUG_FLOW:
            await async_log(f"Game ended.Winner: Player {winner}")
