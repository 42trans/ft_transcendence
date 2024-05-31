# docker/srcs/uwsgi-django/pong/online/pong_online_match.py
from ...utils.async_logger import async_log

# Dev時DEBUG用ログ出力を切り替え
ASYNC_LOG_FOR_DEV = 0

class PongOnlineDuelMatch:
    def __init__(self, pong_engine_data, consumer):
        self.pong_engine_data   = pong_engine_data
        self.consumer           = consumer

    async def update_score(self, scorer):
        if ASYNC_LOG_FOR_DEV:
            await async_log("開始:update_score()")

        if scorer == 1:
            self.pong_engine_data["state"]["score1"] += 1
        else:
            self.pong_engine_data["state"]["score2"] += 1
        # await async_log(f"score1: {self.pong_engine_data['state']['score1']}")
        # await async_log(f"score2: {self.pong_engine_data['state']['score2']}")

        if await self.is_match_end():
            await self.end_game()

    async def is_match_end(self)-> bool:
        return (
            self.pong_engine_data["state"]["score1"] >= self.pong_engine_data["game_settings"]["max_score"] or 
            self.pong_engine_data["state"]["score2"] >= self.pong_engine_data["game_settings"]["max_score"]
        )

    async def end_game(self):
        if ASYNC_LOG_FOR_DEV:
            await async_log("開始:end_game()")

        self.pong_engine_data["is_running"] = False
        winner = 1 if self.pong_engine_data["state"]["score1"] > self.pong_engine_data["state"]["score2"] else 2
        
        await self.consumer.channel_layer.group_send(self.consumer.room_group_name, {
            "type": "send_event_to_client",  
            "event_type": "game_end",
            "event_data": {
                "winner": winner,
                'end_game_state': self.pong_engine_data
            }
        })
        await self.consumer.disconnect(None)
        await async_log(f"Game ended.Winner: Player {winner}")
