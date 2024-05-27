# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_game_manager.py
from ...utils.async_logger import async_log

class PongOnlineDuelMatchStartManager:
    def __init__(self, consumer, game_manager):
        self.game_manager   = game_manager
        self.consumer       = consumer

    async def handle_both_players_connected(self):
        """2人のプレイヤーが接続された場合の処理"""
        await async_log("2名がinしました")

        # パドルの割り当て
        for user_id in self.game_manager.get_user_ids():
            if user_id not in self.game_manager.user_paddle_map:
                self.assign_paddle(user_id)

        # ルームにいる二人に向けて個別にパドル情報を送信
        for user_id in self.game_manager.get_user_ids():
            channel_name = self.get_channel_name(user_id)
            paddle_info = self.get_paddle_for_user(user_id)
            await async_log(f"send paddle_info {paddle_info}, user_id: {user_id}")
            await self.consumer.channel_layer.send(
                channel_name,
                {
                    "type": "send_event_to_client",
                    "event_type": "duel.both_players_entered_room",
                    "event_data": {
                        'message': 'Both players have entered the room. Get ready!',
                        'user_id': user_id,
                        'paddle': paddle_info
                    }
                }
            )

    def assign_paddle(self, user_id):
        """ユーザーにパドルを割り当てる。
        - user_id (int): パドルを割り当てるユーザーのID。
        """
        if 'paddle1' not in self.game_manager.user_paddle_map.values():
            self.game_manager.user_paddle_map[user_id] = 'paddle1'
        else:
            self.game_manager.user_paddle_map[user_id] = 'paddle2'

    def get_channel_name(self, user_id):
        """ユーザーIDに対応するチャネル名を取得"""
        return self.game_manager.user_channels.get(user_id)
    
    def get_paddle_for_user(self, user_id):
        """指定されたユーザーに割り当てられたパドルを取得する"""
        return self.game_manager.user_paddle_map.get(user_id, None)
    

