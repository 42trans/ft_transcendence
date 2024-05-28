# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_consumer_disconnect_handler.py
from channels.db import database_sync_to_async
from .pong_online_duel_config import g_GAME_MANAGERS_LOCK, game_managers, g_REDIS_LOCK
from ...utils.async_logger import async_log
import gc
import json
import redis

# ---------------------------------------------------------------
# disconnect
# ---------------------------------------------------------------
class PongOnlineDuelDisconnectHandler:
    def __init__(self, consumer, game_manager):
        self.consumer = consumer
        self.game_manager = game_manager

    async def handle(self, close_code):
        # await async_log("開始: DisconnectHandler()↓")
        async with g_REDIS_LOCK: 
            if not await self.is_user_connected():
                await async_log("このユーザーの切断処理は既に完了しています。")
                return
        
        try:
            # Channel Layerのグループからユーザーを削除
            await self.consumer.channel_layer.group_discard(
                self.consumer.room_group_name, 
                self.consumer.channel_name
            )
            # Redis, GameManagerの削除
            await self.clear_game_manager_and_redis_room()
        except Exception as e:
            await async_log(f"Error: disconnect() failed: {e}")
        await async_log("終了: DisconnectHandler()↑")


    async def is_user_connected(self):
        # Redisでユーザーの存在を確認
        redis_client = self.game_manager.redis_client
        return await database_sync_to_async(redis_client.sismember)(
            self.consumer.room_group_name, 
            self.consumer.user_id)


    async def clear_game_manager_and_redis_room(self):
        """
        Redisのルーム情報をクリアする。

        - ルームからユーザーを削除
        - Channel Layerのグループからユーザーを削除
        - game_managers から先に削除
        - ルームが空になったらRedisのルーム情報を削除し、Redisクライアントを閉じる

        - Redisのセット: keyと、value=std::set, のようなmap,辞書のようなもの
        redis_sets = {
            "set1": {"apple", "banana", "orange"},
            "set2": {"grape", "melon", "watermelon"}
        }
        """
        await async_log("開始: clear_game_manager_and_redis_room()↓")
        if not self.game_manager.redis_client:
            return

        redis_client = self.game_manager.redis_client
        room_group_name = self.consumer.room_group_name

        try:
            # Redisからユーザーとルーム情報を削除
            # User数=0の確認が重複しないようにlock
            async with g_REDIS_LOCK: 
                # srem: 指定されたセット(key)から、指定されたメンバー(member)を削除
                await database_sync_to_async(redis_client.srem)(
                    room_group_name, 
                    self.consumer.user_id
                )
                remaining_users = await database_sync_to_async(redis_client.scard)(
                    room_group_name
                )

            await async_log(f"remaining_users: {remaining_users}, consumer.user_id:{self.consumer.user_id}")
            # ルームが空になったらgame_managerとRedisのルーム情報を削除し、それからRedisクライアントを閉じる
            if remaining_users == 0:
                await async_log("開始: 0名の場合の処理↓")

                # Redisのルーム情報を削除
                await database_sync_to_async(redis_client.delete)(
                    room_group_name
                )
                # Redisのgame_state情報を削除
                await database_sync_to_async(self.game_manager.redis_client.delete)(
                    f"game_state:{self.consumer.room_group_name}"
                )

                async with g_GAME_MANAGERS_LOCK:
                    del game_managers[self.consumer.room_name]  

                await async_log("終了: Lockして room delete↑")


                # game_managerへの参照を解除 (連戦時にGameManagerがリセットされないバグ対策に試行。メモリリーク対策でもある)
                self.game_manager = None  
                # DEBUG: game_managers の状態を出力
                await async_log(f"game_managers: {game_managers}")

                # ----------------------------------------------
                # DEBUG: ガベージコレクション前後のメモリ使用量を出力
                # ----------------------------------------------
                # await async_log(f"Before gc.collect(): {gc.get_count()}")
                # # ガベージコレクション（プログラムが使用しなくなったメモリ領域を自動的に解放する仕組み） を手動で実行して可視化
                # gc.collect()
                # await async_log(f"After gc.collect(): {gc.get_count()}")
        except Exception as e: 
            await async_log(f"Error clearing Redis room: {e}")