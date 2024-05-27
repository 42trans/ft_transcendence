# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_game_manager.py
# from ..pong_online_config import PongOnlineConfig
# from ..pong_online_init import PongOnlineInit
# from ..pong_online_update import PongOnlineUpdate
# from ..pong_online_physics import PongOnlinePhysics
# from .pong_online_duel_match import PongOnlineDuelMatch
# import logging
# from typing import Dict, Any
from ...utils.async_logger import async_log
import asyncio
# from accounts.models import CustomUser
from .pong_online_duel_config import g_GAME_MANAGERS_LOCK
from .pong_online_duel_config import g_redis_client
from channels.db import database_sync_to_async
import json
import redis

class PongOnlineDuelRoomeManager:
    def __init__(self, consumer):
        self.consumer           = consumer
        self.room_group_name    = f'duel_{self.consumer.room_name}'

    async def setup_room_and_redis(self, current_user_id):
        """ 
        Redisのセットを作成: Redisのセットはルーム単位で作成
        参考:【チャンネル レイヤー — Channels 4.0.0 ドキュメント】 <https://channels.readthedocs.io/en/stable/topics/channel_layers.html>
        """
        # DEBUG: is Redis room
        # key_exists = await database_sync_to_async(self.redis_client.exists)(
        #             self.room_group_name
        #         )
        # if key_exists:
        #     await async_log(f"data for room '''{self.room_group_name}''' exists")
        # await async_log(f"connect_to_redis:current_user_id:  {current_user_id}")
        await async_log(f"開始: GameManager.setup_room_and_redis()")

        await self.connect_to_redis(current_user_id)

        # Consumerのグループ（Duelルームにブロードキャストするグループ）に追加
        # group_add: グループが存在しない場合は新たに作成し、存在する場合は既存のグループにconsumerを追加
        # room_group_name: 任意の名前、※コンストラクタで指定　ex. f'duel_{self.consumer.room_name}'
        # channel_name: 接続(user)毎に一つ割り当て　
        await self.consumer.channel_layer.group_add(
            self.room_group_name, 
            self.consumer.channel_name
        )

    async def connect_to_redis(self, current_user_id):
        """最大5回リトライしてRedisに接続する"""
        for _ in range(5):
            try:
                await async_log(f"接続ユーザーID: {current_user_id}")
                # Redisのセット self.room_group_name: 特定のルームまたはグループに参加しているユーザーを追跡するために使用
                # sadd: 要素を追加。Redis はセットが存在しない場合に自動的にセットを作成
                await database_sync_to_async(g_redis_client.sadd)(
                    # self.room_group_name という名前のRedisのセットに current_user_id を追加
                    self.room_group_name, 
                    current_user_id
                )
                # Redisへのデータ保存が完了するのを待つ
                await asyncio.sleep(0.1)  

                # DEBUG: 現在接続しているユーザー (members) を取得
                # members = await database_sync_to_async(g_redis_client.smembers)(
                #     self.room_group_name
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
        async with g_GAME_MANAGERS_LOCK:
            # await async_log(f"self.room_group_name: {self.room_group_name}")
            # await async_log(f"user_id: {user_id}")
            is_member = await database_sync_to_async(g_redis_client.sismember)(
                self.room_group_name, 
                user_id
            )
            return bool(is_member)
