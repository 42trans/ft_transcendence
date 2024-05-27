# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py
import json
from channels.db import database_sync_to_async
from ...utils.async_logger import async_log
from accounts.models import CustomUser
import gc

class PongOnlineDuelConsumerUtil:
    ''' utliはクラスメソッド  '''

    @classmethod
    async def send_each_client(cls, consumer, event):
        """ クライアントにイベントを送信 
        consumer.send_event_to_client()の実装
        """
        await async_log("開始: send_event_to_client")
        await async_log(f"{event['event_data']}")

        await consumer.send(text_data=json.dumps({
            'type': event['event_type'],
            'data': event['event_data']
        }))

    @classmethod
    async def broadcast_event(cls, consumer, event):
        """ イベントをブロードキャストする汎用的なメソッド """
        await consumer.channel_layer.group_send(
            consumer.game_manager.room_group_name,
            {
                # Consumerクラスのsend_event_to_clientメソッドを呼び出す
                'type': 'send_event_to_client', 
                'event_type': event['event_type'],
                'event_data': event['event_data']
            }
        )

    @classmethod
    async def broadcast_game_state(cls, consumer, game_state):
        """ ゲーム状態を全参加者に送信する特化したメソッド """
        # グループ(内の全てのクライアント)にゲーム状態を送信する
        await consumer.channel_layer.group_send(
            consumer.game_manager.room_group_name, {
            # consumer.send_event_to_client()を呼び出す
            'type': 'send_event_to_client',
            'event_type': 'game_state',
            'event_data': game_state
        })

    @classmethod
    @database_sync_to_async
    def get_system_user(cls):
        return CustomUser.objects.get(is_system=True)

    @classmethod
    @database_sync_to_async
    def get_user_by_nickname(cls, nickname: str):
        return CustomUser.objects.get(nickname=nickname)


