# docker/srcs/uwsgi-django/pong/online/pong_online_consumer_action_handler.py
import json
from ..utils.async_logger import async_log

# asyn_log: docker/srcs/uwsgi-django/pong/utils/async_log.log
DEBUG_FLOW = 1
DEBUG_DETAIL = 0

class PongOnlineConsumerActionHandler:
    def __init__(self, consumer, game_manager):
        self.consumer       = consumer
        self.game_manager   = game_manager

    async def init_handler(self):
        if DEBUG_FLOW:
            # jsonデータはkey==actionのみで中身は無し expected = {"action": "initialize"}
            await async_log("初回クライアントからの受信: action == 'initialize':")
        initial_state = self.game_manager.pong_engine_data
        await self.consumer.send(text_data=json.dumps(initial_state))
        if DEBUG_DETAIL:
            await async_log(f"init_handler: {initial_state}")

    async def reconnect_handler(self, json_data):
        if DEBUG_FLOW:
            await async_log("再接続時: クライアントからの受信: " + json.dumps(json_data))
        await self.game_manager.restore_game_state(json_data)
        restored_state = self.game_manager.pong_engine_data
        await self.consumer.channel_layer.group_send(self.room_group_name, {
            'type': 'send_data',
            'data': restored_state
        })

    async def update_handler(self, json_data):
        if DEBUG_DETAIL:
            await async_log("更新時クライアントからの受信: " + json.dumps(json_data))
        await self.game_manager.update_game(json_data['objects'])
        updated_state = self.game_manager.pong_engine_data
        if DEBUG_DETAIL:
            await async_log("更新時engine_data: " + json.dumps(updated_state))
        await self.consumer.channel_layer.group_send(self.consumer.room_group_name, {
            'type': 'send_data',
            'data': updated_state
        })


