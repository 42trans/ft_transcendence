# docker/srcs/uwsgi-django/pong/online/pong_online_match.py
from ...utils.async_logger import async_log
from channels.db import database_sync_to_async
import json

class PongOnlineDuelMatch:
    def __init__(self, pong_engine_data, consumer):
        self.pong_engine_data   = pong_engine_data
        self.consumer           = consumer

    async def update_score(self, scorer):
        if scorer == 1:
            self.pong_engine_data["state"]["score1"] += 1
        else:
            self.pong_engine_data["state"]["score2"] += 1

        await async_log(f"score1: {self.pong_engine_data['state']['score1']}")
        await async_log(f"score2: {self.pong_engine_data['state']['score2']}")
        await self.check_match_end()

    async def check_match_end(self):
        if (self.pong_engine_data["state"]["score1"] >= self.pong_engine_data["game_settings"]["max_score"] or 
            self.pong_engine_data["state"]["score2"] >= self.pong_engine_data["game_settings"]["max_score"]):
            await self.end_game()

    async def end_game(self):
        self.pong_engine_data["is_running"] = False
        winner = 1 if self.pong_engine_data["state"]["score1"] > self.pong_engine_data["state"]["score2"] else 2
        # await self.consumer.channel_layer.group_send(self.consumer.room_group_name, {
        #         "type": "game_end",
        #         "winner": winner
        #     })
        await self.consumer.channel_layer.group_send(self.consumer.room_group_name, {
            "type": "send_event_to_client",  # send_event_to_client を指定
            "event_type": "game_end",
            "event_data": {"winner": winner}
        })
        await database_sync_to_async(self.consumer.redis_client.delete)(f"game_state:{self.consumer.room_name}")
        await async_log(f"Game ended.Winner: Player {winner}")
