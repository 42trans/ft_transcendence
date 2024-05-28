# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_consumer_receive_handler.py
import json
from channels.db import database_sync_to_async
from ...utils.async_logger import async_log
from .pong_online_duel_config import g_REDIS_START_SIGNAL_LOCK, g_GAME_MANAGERS_LOCK, g_REDIS_STATE_LOCK


class PongOnlineDuelReceiveHandler:
    ''' Consumerのサブクラス 受信時のアクションを処理するハンドラー'''
    def __init__(self, consumer, game_manager):
        self.consumer = consumer
        self.game_manager = game_manager


    async def handle_start_action(self, json_data):
        """
        ゲーム開始アクションの処理
        両方のプレイヤーが start button をクリックするのを待つ
        - 使用するRedisのセット: f"start_signals_{self.game_manager.room_group_name}" : クライアントがstartボタンを押した数を数える目的。すぐに削除する

        # Redisの混乱するポイント
        - Redisはキーと値のペア(構造体,RedisObject)を保存するデータベース
        - 値はリストやセットなどのデータ構造も可能。
        - Redisのコマンドを実行することで、自動的に適切なオブジェクトが作成・管理(明示的にインスタンス化する必要はない）

        ## Redis key  f"start_signals_* に関する処理の流れ: RedisのsetがC++とちょっと違う(setを値とするmap) : 
        - キーの生成(sadd): f"start_signals_{self.game_manager.room_group_name}" という形式で、各ゲームルームに固有のキーを生成。
        - セットへの追加 (sadd): プレイヤーがスタートボタンを押すたびに、そのプレイヤーのIDがセットに追加。
        - カウント (scard): セットの要素数をカウントし、2人分のスタートシグナルが揃ったか確認。
        - キーの削除 (delete): ゲーム開始後、start_signals_* キーを削除。このメソッド内で作成し、削除まで完結する。
        """
        # await async_log("START action")
        try:
            async with g_REDIS_START_SIGNAL_LOCK:
                # redis key: start_signals_*: スタートシグナルが2つ揃ったか確認用。 このメソッド内だけで使用
                # Redisの.saddと.setは、キーが存在しなければ暗黙的に作成する（Redis の内部的な処理）
                # saddでcreate, init的なことも行なってしまう。
                # Redisの設計思想: キーの存在確認を省略することで、コードを簡潔に保ち、処理のオーバーヘッドを削減
                await database_sync_to_async(self.game_manager.redis_client.sadd)(
                                                f"start_signals_{self.game_manager.room_group_name}", 
                                                self.consumer.scope["user"].id
                                            )
                # await async_log(f"START action: start_signals_{self.game_manager.room_group_name}")
                signal_count = await database_sync_to_async(self.game_manager.redis_client.scard)(
                    f"start_signals_{self.game_manager.room_group_name}"
                )
                # await async_log(f"signal_count: {signal_count}")
            # スタートシグナルが2つ揃ったか確認
            if signal_count == 2:
                await async_log("両方のプレイヤーが準備完了しました。ゲームを開始します。")
                initial_state = self.game_manager.pong_engine_data
                await self.consumer.send_game_state(initial_state)
                # await async_log(f"initial_state: {initial_state}")
                # Redisスタートシグナルに関するkey自体を削除。全部削除
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
            # await async_log(f"更新時: game_manager.update_game: {self.consumer.user_id}")
        updated_state = self.game_manager.pong_engine_data

        # バックアップ的な用途
        async with g_REDIS_STATE_LOCK:
            # 更新されたゲーム状態をRedis f"game_state: に保存
            await database_sync_to_async(self.game_manager.redis_client.set)(
                f"game_state:{self.consumer.room_group_name}",
                json.dumps(updated_state)
            )
            # await async_log("更新時engine_data: " + json.dumps(updated_state))

        # # Resisから取り出す場合
        # async with g_REDIS_STATE_LOCK:
        #     game_state_json = await database_sync_to_async(self.game_manager.redis_client.get)(
        #         f"game_state:{self.consumer.room_group_name}"
        #     )
        #     if game_state_json:
        #         # ゲーム状態が存在する場合、JSONをデコードしてクライアントに送信
        #         game_state = json.loads(game_state_json)
        #         await self.consumer.send_game_state(game_state)

        # redisデータを使用せずに高速処理を行う
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

    