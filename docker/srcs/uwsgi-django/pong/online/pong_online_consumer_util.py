# docker/srcs/uwsgi-django/pong/online/pong_online_consumer_util.py
# from ..utils.async_logger import async_log

# asyn_log: docker/srcs/uwsgi-django/pong/utils/async_log.log
DEBUG_FLOW = 1
DEBUG_DETAIL = 0

class PongOnlineConsumerUtil:

    @classmethod
    async def broadcast_event(cls, consumer, event):
        """ イベントをブロードキャストする汎用的なメソッド """
        await consumer.channel_layer.group_send(
            consumer.room_group_name,
            {
                # Consumerクラスのメソッド send_data が呼び出される cnannelsの仕様
                'type': 'send_data', 
                'data': event['data']
            }
        )

    @classmethod
    async def broadcast_game_state(cls, consumer, game_state):
        """ 
        ゲーム状態をグループに送信する
        ゲーム状態を全参加者に送信する特化したメソッド 
        """
        event = {
             "data": {
                "event_type": "game_state",
                "game_state": game_state
            }
        }
        await cls.broadcast_event(consumer, event)


    @classmethod
    async def broadcast_game_end(cls, consumer, winner, game_state):
        """ ゲーム終了イベントをグループに送信する """
        event = {
            "data": {
                "event_type": "game_end",
                "winner": winner,
                "end_game_state": game_state
            }
        }
        await cls.broadcast_event(consumer, event)

