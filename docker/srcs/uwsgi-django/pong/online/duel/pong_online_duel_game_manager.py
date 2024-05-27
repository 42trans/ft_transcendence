# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_game_manager.py
from ..pong_online_config import PongOnlineConfig
from ..pong_online_init import PongOnlineInit
from ..pong_online_update import PongOnlineUpdate
from ..pong_online_physics import PongOnlinePhysics
from ..pong_online_match import PongOnlineMatch
from .pong_online_duel_match import PongOnlineDuelMatch
import logging
from typing import Dict, Any, Optional
from ...utils.async_logger import async_log
import asyncio
from accounts.models import CustomUser
from .pong_online_duel_config import g_GAME_MANAGERS_LOCK
from .pong_online_duel_config import g_redis_client

from channels.db import database_sync_to_async
import json

import redis
# import os
# # Redis クライアントの初期化
# redis_host = os.getenv('REDIS_HOST', 'redis')
# redis_port = os.getenv('REDIS_PORT', 6379)
# # グローバル
# g_redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)


logger = logging.getLogger(__name__)


class PongOnlineDuelGameManager:
    """ room に対しインスタンスを一つだけ生成"""
    def __init__(self, consumer):
        self.config = PongOnlineConfig()
        self.pong_engine_data: Dict[str, Any] = {
            "objects": {},
            "game_settings": {},
            "state": {},
            "is_running": None
        }
        self.match              = None
        self.physics            = None
        self.pong_engine_update = None
        self.consumer           = consumer
        # Userインスタンスとパドル名
        self.user_paddle_map: Dict[CustomUser, str]     = {}
        # Userインスタンス
        self.connected_users: list[CustomUser]          = []
        # user_id を key とし、channel_name を value とする辞書
        self.user_channels: Dict[int, str]              = {}
        # Redisインスタンス
        # Redis clientは一つだけ。configに置いた変数（グローバル変数的な用途）。他のクラスからはGameManagerを介して参照するために自身の属性として持っておく
        self.redis_client          = g_redis_client
        self.room_group_name = f'duel_{self.consumer.room_name}'


    async def initialize_game(self):
        init                    = PongOnlineInit(self.config)
        self.pong_engine_data   = init.init_pong_engine()
        self.match              = PongOnlineDuelMatch(self.pong_engine_data, self.consumer)
        self.physics            = PongOnlinePhysics(self.pong_engine_data)
        self.pong_engine_update = PongOnlineUpdate(
            self.pong_engine_data,
            self.physics,
            self.match
        )
        await async_log(f"initialize_game().pong_engine_data: {self.pong_engine_data}")
        return self


    async def is_user_connected_to_room(self, user_id):
        """ユーザーがルームにWebSocket接続しているかどうかを判定する"""
        async with g_GAME_MANAGERS_LOCK:
            is_member = await database_sync_to_async(g_redis_client.sismember)(
                self.room_group_name, user_id
            )
            return bool(is_member)
    
    async def is_both_players_connected(self, user1, user2):
        """2人のプレイヤーが接続されているかどうかを判定する"""
        await async_log(f"開始: is_both_players_connected()")
        await async_log(f"scope = self.consumer.scope: scope = self.consumer.scope")
        await async_log(f"self.consumer.user_id: {self.consumer.user_id}")
        await async_log(f"self.consumer.other_user_id: {self.consumer.other_user_id}")

        is_user1_connected = await self.is_user_connected_to_room(user1)
        is_user2_connected = await self.is_user_connected_to_room(user2)
        await async_log(f"is_user1_connected: {is_user1_connected}")
        await async_log(f"is_user2_connected: {is_user2_connected}")
        return is_user1_connected and is_user2_connected

    async def handle_both_players_connected(self):
        """2人のプレイヤーが接続された場合の処理"""
        await async_log("2名がinしました")

        # パドルの割り当て
        for user_id in self.get_user_ids():
            if user_id not in self.user_paddle_map:
                self.assign_paddle(user_id)

        # ルームにいる二人に向けて個別にパドル情報を送信
        for user_id in self.get_user_ids():
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
        if 'paddle1' not in self.user_paddle_map.values():
            self.user_paddle_map[user_id] = 'paddle1'
        else:
            self.user_paddle_map[user_id] = 'paddle2'

    def get_channel_name(self, user_id):
        """ユーザーIDに対応するチャネル名を取得"""
        return self.user_channels.get(user_id)
    
    def get_paddle_for_user(self, user_id):
        """指定されたユーザーに割り当てられたパドルを取得する"""
        return self.user_paddle_map.get(user_id, None)
    



    async def setup_room_and_redis(self):
        """ 
        Redisのセットを作成: Redisのセットはルーム単位で作成
        参考:【チャンネル レイヤー — Channels 4.0.0 ドキュメント】 <https://channels.readthedocs.io/en/stable/topics/channel_layers.html>
        """
        # 前回のルーム情報を削除して初期化する。
        await database_sync_to_async(g_redis_client.delete)(
            self.room_group_name
        )
        await self.connect_to_redis(self.consumer.scope["user"].id)
        # Consumerのグループ（Duelルームにブロードキャストするグループ）に追加
        # group_add: グループが存在しない場合は新たに作成し、存在する場合は既存のグループにconsumerを追加
        # room_group_name: 任意の名前、※コンストラクタで指定　ex. f'duel_{self.consumer.room_name}'
        # channel_name: 接続(user)毎に一つ割り当て　
        await self.consumer.channel_layer.group_add(
            self.room_group_name, 
            self.consumer.channel_name
        )
        await async_log(f"room_group_name: {self.room_group_name}")
        # ゲーム状態の初期化
        await self.initialize_game_state()

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
        

    async def initialize_game_state(self):
        """
        ゲーム状態を初期化する
        まず、Redis からゲーム状態を取得して、それによって分岐する
        - Redisのセット: f"game_state:{self.consumer.room_name}": ゲームの状態に使用
        """
        game_state = await database_sync_to_async(g_redis_client.get)(
            f"game_state:{self.consumer.room_name}"
        )
        if game_state is None:
            # Redis にゲーム状態が保存されていない場合
            await self.initialize_game()
            game_state = self.get_state()
            await async_log(f"None game_state: {game_state}")
            await database_sync_to_async(g_redis_client.set)(
                f"game_state:{self.consumer.room_name}", json.dumps(game_state)
            )
        else:
            # Redis にゲーム状態が保存されている場合
            game_state = json.loads(game_state)
            await async_log(f"Exist game_state: {game_state}")
            await self.restore_game_state(game_state)



    def register_channel(self, user_id, channel_name):
        """ユーザーIDとチャネル名のマッピングを登録"""
        self.user_channels[user_id] = channel_name

    def register_user(self, user_id):
        """ユーザーを登録する"""
        if user_id not in self.connected_users:
            self.connected_users.append(user_id)

    def get_user_ids(self):
        """接続されているユーザーのIDリストを返す"""
        return self.connected_users



    def get_state(self):
        return self.pong_engine_data

    async def update_game(self, json_data):
        async with g_GAME_MANAGERS_LOCK:
            await self.pong_engine_update.update_game(json_data)
            return self


    async def restore_game_state(self, client_json_state):
        try:
            if "game_settings" in client_json_state:
                self.pong_engine_data["game_settings"].update(client_json_state["game_settings"])
            if "objects" in client_json_state:
                for key in ["ball", "paddle1", "paddle2"]:
                    if key in client_json_state["objects"]:
                        self.pong_engine_data["objects"][key].update(client_json_state["objects"][key])
            if "state" in client_json_state:
                self.pong_engine_data["state"].update(client_json_state["state"])
            if "is_running" in client_json_state:
                self.pong_engine_data["is_running"] = client_json_state["is_running"]
            await async_log(f"Restored game state successfully.")
        except Exception as e:
            await async_log(f"Failed to restore game state: {str(e)}")
            raise e

