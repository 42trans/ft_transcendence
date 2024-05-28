# docker/srcs/uwsgi-django/pong/online/pong_online_match.py
from ...utils.async_logger import async_log

class PongOnlineDuelMatch:
    def __init__(self, pong_engine_data, consumer):
        self.pong_engine_data   = pong_engine_data
        self.consumer           = consumer

    async def update_score(self, scorer):
        # await async_log("開始:update_score()")

        if scorer == 1:
            self.pong_engine_data["state"]["score1"] += 1
        else:
            self.pong_engine_data["state"]["score2"] += 1

        # await async_log(f"score1: {self.pong_engine_data['state']['score1']}")
        # await async_log(f"score2: {self.pong_engine_data['state']['score2']}")
        await self.check_match_end()

    async def check_match_end(self):
        # await async_log("開始:check_match_end()")
        if (self.pong_engine_data["state"]["score1"] >= self.pong_engine_data["game_settings"]["max_score"] or 
            self.pong_engine_data["state"]["score2"] >= self.pong_engine_data["game_settings"]["max_score"]):
            await self.end_game()

    async def end_game(self):
        # await async_log("開始:end_game()")

        self.pong_engine_data["is_running"] = False
        winner = 1 if self.pong_engine_data["state"]["score1"] > self.pong_engine_data["state"]["score2"] else 2
        
        await self.consumer.channel_layer.group_send(self.consumer.room_group_name, {
            # send_event_to_client を指定
            "type": "send_event_to_client",  
            "event_type": "game_end",
            "event_data": {
                "winner": winner,
                'end_game_state': self.pong_engine_data
            }
        })
        await self.consumer.disconnect(None)
        await async_log(f"Game ended.Winner: Player {winner}")
