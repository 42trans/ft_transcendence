# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py
import json
from channels.db import database_sync_to_async
from ...utils.async_logger import async_log

class PongOnlineDuelReceiveHandler:
    ''' Consumerのサブクラス 受信時のアクションを処理するハンドラー'''
    def __init__(self, consumer):
        self.consumer = consumer


    async def handle_start_action(self, json_data):
        """ゲーム開始アクションの処理"""
        await database_sync_to_async(self.consumer.redis_client.sadd)(
                                        f"start_signals_{self.consumer.room_group_name}", 
                                        self.consumer.scope["user"].id
                                    )
        # スタートシグナルが2つ揃ったか確認
        signal_count = await database_sync_to_async(self.consumer.redis_client.scard)(f"start_signals_{self.consumer.room_group_name}")
        if signal_count == 2 and hasattr(self.consumer, 'game_manager'):
            await async_log("両方のプレイヤーが準備完了しました。ゲームを開始します。")
            initial_state = self.consumer.game_manager.pong_engine_data
            await self.consumer.send_game_state(initial_state)
            # RedisのSetを削除
            await database_sync_to_async(self.consumer.redis_client.delete)(f"start_signals_{self.consumer.room_group_name}")
        else:
            await self.consumer.send(text_data=json.dumps({"message": "Waiting for another player to start"})) 

    async def handle_reconnect_action(self, json_data):
        """
        - 更新時データ構造: game_settingsを含む全てのデータを送信している
        - 送信時データ構造: game_settingsを含む全てのデータを送信している
        """
        # await async_log("再接続時: クライアントからの受信: " + json.dumps(json_data))
        await self.consumer.game_manager.restore_game_state(json_data)
        restored_state = self.consumer.game_manager.pong_engine_data
        # await async_log("再接続時: engine_data: " + json.dumps(restored_state))
        await self.consumer.send_game_state(restored_state)

    async def handle_update_action(self, json_data):
        """
        ※ TOOD_ft:処理高速化のために必要な情報に絞りたい
        - 計算時データ構造: objectsのみ
        - 送信時データ構造: game_settingsを含む全てのデータを送信している
        """
        # await async_log("更新時クライアントからの受信: " + json.dumps(json_data))
        await self.consumer.game_manager.update_game(json_data['objects'])
        updated_state = self.consumer.game_manager.pong_engine_data
        # 更新されたゲーム状態をRedisに保存
        await database_sync_to_async(self.consumer.redis_client.set)(
            f"game_state:{self.consumer.room_name}",
            json.dumps(updated_state)
        )
        # await async_log("更新時engine_data: " + json.dumps(updated_state))
        await self.consumer.send_game_state(updated_state)
    
    async def handle_invalid_action(self, json_data):
        """ 
        期待されるキーが含まれていない場合
         - code: RFC6455 WebSocket app 4000 + 400 Bad Request
        """
        await self.consumer.send(text_data=json.dumps({"error": "Invalid request format"}))
        await self.consumer.close(code=4400)  
        
    async def handle_error(self, e):
        """ code: RFC6455 WebSocket app 4000 + 500 Internal server error """
        await self.consumer.send(text_data=json.dumps({"error": "Internal server error", "details": str(e)}))
        await self.consumer.close(code=4500)

    