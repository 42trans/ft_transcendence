# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_consumer_receive_handler.py
import json
from channels.db import database_sync_to_async
from ...utils.async_logger import async_log
from .pong_online_duel_config import g_GAME_MANAGERS_LOCK


class PongOnlineDuelReceiveHandler:
    ''' Consumerのサブクラス 受信時のアクションを処理するハンドラー'''
    def __init__(self, consumer, game_manager):
        self.consumer = consumer
        self.game_manager = game_manager


    async def handle_start_action(self, json_data):
        """ゲーム開始アクションの処理"""
        async with g_GAME_MANAGERS_LOCK:
            # await async_log("START action")
            try:
                # Redisのセット: f"start_signals_{self.game_manager.room_group_name}" : クライアントがstartボタンを押した数を数える目的
                await database_sync_to_async(self.game_manager.redis_client.sadd)(
                                                f"start_signals_{self.game_manager.room_group_name}", 
                                                self.consumer.scope["user"].id
                                            )
                # await async_log(f"START action: start_signals_{self.game_manager.room_group_name}")
                # スタートシグナルが2つ揃ったか確認
                signal_count = await database_sync_to_async(self.game_manager.redis_client.scard)(
                    f"start_signals_{self.game_manager.room_group_name}"
                )
                # await async_log(f"signal_count: {signal_count}")
                if signal_count == 2:
                    await async_log("両方のプレイヤーが準備完了しました。ゲームを開始します。")
                    # await async_log(f"self.game_manager.pong_engine_data: {self.game_manager.pong_engine_data}")
                    initial_state = self.game_manager.pong_engine_data
                    await self.consumer.send_game_state(initial_state)
                    # await async_log(f"initial_state: {initial_state}")
                    # Redisに保存されているスタートシグナルの情報を削除
                    await database_sync_to_async(self.game_manager.redis_client.delete)(
                        f"start_signals_{self.game_manager.room_group_name}"
                        )
                else:
                    await self.consumer.send(text_data=json.dumps({
                        "message": "Waiting for another player to start"
                    })) 
                # await async_log("終了: handle_start_action()")
            except Exception as e:
                await async_log(f"Error: {e}")

    async def handle_reconnect_action(self, json_data):
        """
        - 更新時データ構造: game_settingsを含む全てのデータを送信している
        - 送信時データ構造: game_settingsを含む全てのデータを送信している
        """
        # await async_log("再接続時: クライアントからの受信: " + json.dumps(json_data))
        await self.game_manager.restore_game_state(json_data)
        restored_state = self.game_manager.pong_engine_data
        # await async_log("再接続時: engine_data: " + json.dumps(restored_state))
        await self.consumer.send_game_state(restored_state)

    async def handle_update_action(self, json_data):
        """
        ※ TOOD_ft:処理高速化のために必要な情報に絞りたい
        - 計算時データ構造: objectsのみ
        - 送信時データ構造: game_settingsを含む全てのデータを送信している
        """
        async with g_GAME_MANAGERS_LOCK:
            # await async_log("更新時クライアントからの受信: " + json.dumps(json_data))
            await self.game_manager.update_game(json_data['objects'])
            # await async_log("更新時: game_manager.update_game")
            updated_state = self.game_manager.pong_engine_data
            # 更新されたゲーム状態をRedisに保存
            await database_sync_to_async(self.game_manager.redis_client.set)(
                f"game_state:{self.consumer.room_group_name}",
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

    