# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_consumer_disconnect_handler.py
from channels.db import database_sync_to_async
from rest_framework.permissions import IsAuthenticated
from .pong_online_duel_config import g_GAME_MANAGERS_LOCK, game_managers
from ...utils.async_logger import async_log
import gc
# ---------------------------------------------------------------
# disconnect
# ---------------------------------------------------------------
class PongOnlineDuelDisconnectHandler:
    def __init__(self, consumer):
        self.consumer = consumer

    async def handle(self, close_code):
        await async_log("終了: DisconnectHandler()")
        async with g_GAME_MANAGERS_LOCK: #排他制御
            try:
                await self.clear_redis_room()
            except Exception as e:
                await async_log(f"Error: disconnect() failed: {e}")
        await async_log("終了: DisconnectHandler()")


    async def clear_redis_room(self):
        """
        Redisのルーム情報をクリアする。

        - ルームからユーザーを削除
        - Channel Layerのグループからユーザーを削除
        - game_managers から先に削除
        - ルームが空になったらRedisのルーム情報を削除し、Redisクライアントを閉じる
        """
        if not self.game_manager.redis_client:
            return

        redis_client = self.game_manager.redis_client
        room_group_name = self.game_manager.room_group_name

        try:
            # Redisからユーザーとルーム情報を削除
            await database_sync_to_async(redis_client.srem)(
                room_group_name, 
                self.scope["user"].id
            )
            # ユーザー数をカウント
            remaining_users = await database_sync_to_async(redis_client.scard)(
                room_group_name
            )
            # Channel Layerのグループからユーザーを削除
            await self.channel_layer.group_discard(room_group_name, self.channel_name)

            # ルームが空になったらgame_managerとRedisのルーム情報を削除し、それからRedisクライアントを閉じる
            if remaining_users == 0:
                # Redisのルーム情報とgame_managerを削除
                # game_managers から先に削除
                del game_managers[self.room_name]  
                await database_sync_to_async(redis_client.delete)(
                    room_group_name
                )
                redis_client.close()
                # game_managerへの参照を解除 (連戦時にGameManagerがリセットされないバグ対策に試行。メモリリーク対策でもある)
                self.game_manager = None  

                # DEBUG: ガベージコレクション前後のメモリ使用量を出力
                await async_log(f"Before gc.collect(): {gc.get_count()}")
                gc.collect()
                await async_log(f"After gc.collect(): {gc.get_count()}")
                # DEBUG: game_managers と redis_client の状態を出力
                # ルームが正しく削除され、Redisクライアントが閉じられているかを確認
                await async_log(f"game_managers: {game_managers}")
                await async_log(f"redis_client is closed: {redis_client.closed}")
        except Exception as e:  # Redis操作のエラーハンドリング
            await async_log(f"Error clearing Redis room: {e}")