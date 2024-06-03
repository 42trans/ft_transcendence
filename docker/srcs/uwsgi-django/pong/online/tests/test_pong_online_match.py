from django.test import TestCase
from pong.online.pong_online_game_manager import PongOnlineGameManager
from asgiref.sync import async_to_sync
from unittest.mock import MagicMock, AsyncMock

class TestPongOnlineMatch(TestCase):
    def setUp(self):
        mock_consumer = MagicMock()  
        mock_consumer.channel_layer = MagicMock()
        mock_consumer.channel_layer.group_send = AsyncMock() 
        mock_consumer.room_group_name = "test_group"  # ダミーのグループ名を設定
        mock_consumer.disconnect = AsyncMock()  
        self.game_manager = PongOnlineGameManager(consumer=mock_consumer, user_id=1)
        async_to_sync(self.game_manager.initialize_game)()

    async def test_update_score(self):
        # 初期スコア0であるべき
        self.assertEqual(self.game_manager.pong_engine_data["state"]["score1"], 0)
        self.assertEqual(self.game_manager.pong_engine_data["state"]["score2"], 0)

        # スコアを更新　引数はplayer番号
        await self.game_manager.match.update_score(1)
        self.assertEqual(self.game_manager.pong_engine_data["state"]["score1"], 1)
        self.assertEqual(self.game_manager.pong_engine_data["state"]["score2"], 0)

        # もう一方のプレイヤーのスコアを更新　引数はplayer番号
        await self.game_manager.match.update_score(2)
        self.assertEqual(self.game_manager.pong_engine_data["state"]["score1"], 1)
        self.assertEqual(self.game_manager.pong_engine_data["state"]["score2"], 1)

    async def test_check_match_end(self):
        # スコアを最大点数の直前に設定
        self.game_manager.pong_engine_data["state"]["score1"] = self.game_manager.pong_engine_data["game_settings"]["max_score"] - 1
        self.game_manager.pong_engine_data["state"]["score2"] = 0

        # スコアを更新して試合終了条件を満たす
        await self.game_manager.match.update_score(1)
        self.assertFalse(
            self.game_manager.pong_engine_data["is_running"],
            "スコアが最大に達したら試合が終了すべき"
        )


