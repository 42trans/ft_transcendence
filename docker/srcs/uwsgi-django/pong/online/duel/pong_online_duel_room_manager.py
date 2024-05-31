# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_room_manager.py
from ...utils.async_logger import async_log
import asyncio
from .pong_online_duel_resources import PongOnlineDuelResources
from channels.db import database_sync_to_async
import redis

# Dev時DEBUG用ログ出力を切り替え
ASYNC_LOG_FOR_DEV = 0

class PongOnlineDuelRoomeManager:
    def __init__(self, consumer):
        self.consumer           = consumer
        # self.room_group_name    = consumer.room_group_name
        self.resources          = PongOnlineDuelResources()

    async def setup_duel_room_redis_store(self, current_user_id):
        if ASYNC_LOG_FOR_DEV:
            await async_log("終了: setup_duel_room_redis_store()")
        await self.connect_to_redis_room(current_user_id)

    async def connect_to_redis_room(self, current_user_id):
        """最大5回リトライしてRedisに接続する"""
        for _ in range(5):
            try:
                # await async_log(f"接続ユーザーID: {current_user_id}")
                # Redisのセット room_group_name: 特定のルームまたはグループに参加しているユーザーを追跡するために使用
                # sadd: 要素を追加。Redis はセットが存在しない場合に自動的にセットを作成
                redis_client = self.resources.get_redis_client()
                await database_sync_to_async(redis_client.sadd)(
                    # room_group_name という名前のRedisのセット名(key)に current_user_id を追加
                    self.consumer.room_group_name, 
                    current_user_id
                )
                # Redisへのデータ保存が完了するのを待つ
                await asyncio.sleep(0.1)  

                # DEBUG: 現在接続しているユーザー (members) を取得
                # members = await database_sync_to_async(g_redis_client.smembers)(
                #     self.consumer.room_group_name
                # )
                # await async_log(f"セットのメンバー: {members}")

                # 接続成功
                break  
            except redis.exceptions.ConnectionError:
                await async_log("Redis への接続に失敗しました。リトライします...")
                await asyncio.sleep(1)
        else:
            # Consumerのcloseメソッドを呼び出す
            await self.consumer.close(code=1011)
            return


    async def is_user_connected_to_room(self, user_id):
        """
        ユーザーがルームにWebSocket接続しているかどうかを判定する
        参考:【SISMEMBER | Docs】 <https://redis.io/docs/latest/commands/sismember/>
        """
        if ASYNC_LOG_FOR_DEV:
            # await async_log(f"self.room_group_name: {self.room_group_name}")
            # await async_log(f"user_id: {user_id}")
            await async_log("開始: is_user_connected_to_room()")
        async with self.resources.get_game_managers_lock():
            redis_client = self.resources.get_redis_client()
            is_member = await database_sync_to_async(redis_client.sismember)(
                self.consumer.room_group_name, 
                user_id
            )
            return bool(is_member)
