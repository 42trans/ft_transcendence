# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_consumer_disconnect_handler.py
from channels.db import database_sync_to_async
from .pong_online_duel_config import g_GAME_MANAGERS_LOCK, game_managers, g_REDIS_LOCK
from ...utils.async_logger import async_log
import gc
import redis

# ---------------------------------------------------------------
# disconnect
# ---------------------------------------------------------------
class PongOnlineDuelDisconnectHandler:
    def __init__(self, consumer, game_manager):
        self.consumer = consumer
        self.game_manager = game_manager

    async def handle(self, close_code):
        await async_log("開始: DisconnectHandler()")
        try:
            # Channel Layerのグループからユーザーを削除
            await self.consumer.channel_layer.group_discard(self.consumer.room_group_name, self.consumer.channel_name)
            # Redis, GameManagerの削除
            await self.clear_game_manager_and_redis_room()
        except Exception as e:
            await async_log(f"Error: disconnect() failed: {e}")
        await async_log("終了: DisconnectHandler()")


    async def clear_game_manager_and_redis_room(self):
        """
        Redisのルーム情報をクリアする。

        - ルームからユーザーを削除
        - Channel Layerのグループからユーザーを削除
        - game_managers から先に削除
        - ルームが空になったらRedisのルーム情報を削除し、Redisクライアントを閉じる
        """
        await async_log("開始: clear_game_manager_and_redis_room()")
        if not self.game_manager.redis_client:
            return

        redis_client = self.game_manager.redis_client
        room_group_name = self.consumer.room_group_name

        try:
            # Redisからユーザーとルーム情報を削除
            # User数=0の確認が重複しないようにlock
            async with g_REDIS_LOCK: 
                await database_sync_to_async(redis_client.srem)(
                    room_group_name, 
                    self.consumer.user_id
                )
                remaining_users = await database_sync_to_async(redis_client.scard)(
                    room_group_name
                )
            await async_log("最初のuserはlockによりこの時点で1になる")
            await async_log(f"remaining_users: {remaining_users}, user:{self.consumer.user_id}")
            # ルームが空になったらgame_managerとRedisのルーム情報を削除し、それからRedisクライアントを閉じる
            if remaining_users == 0:
                await async_log("開始: e")
                # Redisのルーム情報とgame_managerを削除
                # game_managers から先に削除
                await database_sync_to_async(redis_client.delete)(
                    room_group_name
                )
                async with g_GAME_MANAGERS_LOCK:
                    del game_managers[self.consumer.room_name]  

                await async_log("開始: f")
                # game_managerへの参照を解除 (連戦時にGameManagerがリセットされないバグ対策に試行。メモリリーク対策でもある)
                self.game_manager = None  
                # DEBUG: game_managers の状態を出力
                await async_log(f"game_managers: {game_managers}")

                # DEBUG: ガベージコレクション前後のメモリ使用量を出力
                await async_log(f"Before gc.collect(): {gc.get_count()}")
                gc.collect()
                await async_log(f"After gc.collect(): {gc.get_count()}")
        except Exception as e:  # Redis操作のエラーハンドリング
            await async_log(f"Error clearing Redis room: {e}")