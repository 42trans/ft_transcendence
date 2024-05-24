# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py
import json
import asyncio
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import IsAuthenticated
from accounts.models import CustomUser
from .pong_online_duel_game_manager import PongOnlineDuelGameManager
from ...utils.async_logger import async_log
from accounts.models import CustomUser
from chat.models import DMSession, Message

import os
import redis
# Redis クライアントの初期化
redis_host = os.getenv('REDIS_HOST', 'redis')
redis_port = os.getenv('REDIS_PORT', 6379)

class PongOnlineDuelConsumer(AsyncWebsocketConsumer):
    '''
    参考:【チャンネル レイヤー — Channels 4.0.0 ドキュメント】 <https://channels.readthedocs.io/en/stable/topics/channel_layers.html>
    redis: インメモリデータストアの一種
    - async_log: 出力先 docker/srcs/uwsgi-django/pong/utils/async_log.log
    '''
    permission_classes = [IsAuthenticated]


    async def connect(self):
        await async_log("開始:connect() ")
        try: 
            if not await self.authenticate_user():
                return
            # ルーム名を取得
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'duel_room_{self.room_name}'
            # Redis接続
            await self.connect_to_redis(self.scope["user"].id)
            # ルームに追加
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await async_log(f"room_group_name: {self.room_group_name}")
            # 接続受容 clientにonopen()送信
            await self.accept()
            await async_log(f'ws接続 {self.scope["user"]}')

            # Bug: 
            # AsyncWebsocketConsumer のインスタンスは接続ごとに生まれる。つまり二つ生まれる。
            # 他のduel roomに影響するのでクラス変数もグローバル変数も使えない。
            # したがって、ゲーム状態（変数）を共有する場所が必要。
            # 解決策の方針：
            # Redisに毎回保存する
            # Pong game engineをセット
            self.game_manager = PongOnlineDuelGameManager()
            await self.game_manager.initialize_game()
            
            
            # 接続されているユーザー数を取得
            self.client_count = await database_sync_to_async(self.redis_client.scard)(self.room_group_name)
            await async_log(f"client_count: {self.client_count}")
            # 2名インしたらメッセージを送信してconnect()処理終了
            await self.check_opponent_and_send_message()
            await async_log("正常終了: connect()")
        except Exception as e:
            await async_log(f"Redis operation error: {str(e)}")
            # 1011: 予期しない状態または内部エラーが発生
            await self.close(code=1011)
            return


    async def authenticate_user(self):
        """ユーザー認証"""
        if not self.scope["user"].is_authenticated:
            await self.close(code=1008)
            return False
        # URLからuser_idとother_user_idを抽出
        path_segments = self.scope['url_route']['kwargs']['room_name'].split('_')
        user_id, other_user_id = int(path_segments[1]), int(path_segments[2])
        # 現在のユーザーIDを取得
        self.current_user_id = self.scope["user"].id
        # ユーザーIDが一致しない場合は接続を拒否
        if (self.current_user_id != user_id and self.current_user_id != other_user_id):
            await async_log(f"無効なユーザーID: self.current_user_id:{self.current_user_id}, user_id:{user_id}")
            await self.close()
            return False
        return True
    
    async def connect_to_redis(self, current_user_id):
        """
        最大range回リトライ 
        """
        # await async_log("開始:redis ")
        for _ in range(5): 
            try:
                await async_log(f"接続ユーザーID: {current_user_id}")
                self.redis_client = redis.Redis(host=redis_host, port=redis_port)
                added = await database_sync_to_async(self.redis_client.sadd)(self.room_group_name, current_user_id)

                members = await database_sync_to_async(self.redis_client.smembers)(self.room_group_name)
                await async_log(f"セットのメンバー: {members}")

                if not added:
                    await async_log(f"ユーザーは既にルームにいます: {current_user_id}")
                    await self.close()
                    return
                # 接続成功
                break  
            except redis.exceptions.ConnectionError:
                await async_log("Redis への接続に失敗しました。リトライします...")
                await asyncio.sleep(1)
        else:
            await self.close(code=1011)
            return
        # await async_log("終了:redis ")

    async def check_opponent_and_send_message(self):
        """対戦相手の確認とメッセージ送信"""
        if self.client_count == 2:
            await async_log("2名がinしました")
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'duel.both_players_entered_room',
                'room_group_name': self.room_group_name,
                'message': 'Both players have entered the room. Get ready!'
            })
        else:
            # まだ1人目の場合
            await self.send(text_data=json.dumps({
                'type': 'duel.waiting_opponent',
                'message': 'Incoming hotshot! Better get your game face on...'
            }))


    async def duel_both_players_entered_room(self, event):
        """
        両方のプレイヤーがルームに入ったときに呼び出されるメソッド
        """
        await self.send(text_data=json.dumps({
            "type": "duel.both_players_entered_room",
            "room_group_name": event["room_group_name"],
            "message": event["message"],
        }))

    async def game_start(self, event):
        await self.send(text_data=json.dumps(event))

    async def waiting_opponent(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def send_dm_to_user(self, sender, recipient, message_text):
        session = DMSession.get_session(user_id=sender.id, other_user_id=recipient.id)
        message = Message(
            sender=sender,
            receiver=recipient,
            message=message_text
        )
        message.save()

    @database_sync_to_async
    def _get_user_by_nickname(self, nickname: str):
        return CustomUser.objects.get(nickname=nickname)
    



    async def receive(self, text_data=None):
        await async_log("receive(): 開始 クライアントからのtext_data受信: " + text_data)
        try:
            json_data = json.loads(text_data)
            action = json_data.get('action')
            if action == 'start':
                await self.handle_start_action(json_data)
            elif action == 'reconnect':
                await self.handle_reconnect_action(json_data)
            elif action == 'update':
                await self.handle_update_action(json_data)
            else:
                await self.handle_invalid_action()
        except json.JSONDecodeError:
            await self.close(code=1007)
        except Exception as e:
            await self.handle_error(e)


    async def handle_start_action(self, json_data):
        await database_sync_to_async(self.redis_client.sadd)(
                                        f"start_signals_{self.room_group_name}", 
                                        self.scope["user"].id
                                    )
        # スタートシグナルが2つ揃ったか確認
        signal_count = await database_sync_to_async(self.redis_client.scard)(f"start_signals_{self.room_group_name}")
        if signal_count == 2 and hasattr(self, 'game_manager'):
            await async_log("両方のプレイヤーが準備完了しました。ゲームを開始します。")
            initial_state = self.game_manager.pong_engine_data
            await self.send_game_state(initial_state)
            # RedisのSetを削除
            await database_sync_to_async(self.redis_client.delete)(f"start_signals_{self.room_group_name}")
        else:
            await self.send(text_data=json.dumps({"message": "Waiting for another player to start"})) 

    async def handle_reconnect_action(self, json_data):
        """
        - 更新時データ構造: game_settingsを含む全てのデータを送信している
        - 送信時データ構造: game_settingsを含む全てのデータを送信している
        """
        # await async_log("再接続時: クライアントからの受信: " + json.dumps(json_data))
        await self.game_manager.restore_game_state(json_data)
        restored_state = self.game_manager.pong_engine_data
        # await async_log("再接続時: engine_data: " + json.dumps(restored_state))
        await self.send_game_state(restored_state)
    
    async def handle_update_action(self, json_data):
        """
        ※ TOOD_ft:処理高速化のために必要な情報に絞りたい
        - 計算時データ構造: objectsのみ
        - 送信時データ構造: game_settingsを含む全てのデータを送信している
        """
        # await async_log("更新時クライアントからの受信: " + json.dumps(json_data))
        await self.game_manager.update_game(json_data['objects'])
        updated_state = self.game_manager.pong_engine_data
        # await async_log("更新時engine_data: " + json.dumps(updated_state))
        await self.send_game_state(updated_state)
    
    async def handle_invalid_action(self, json_data):
        """ 
        期待されるキーが含まれていない場合
         - code: RFC6455 WebSocket app 4000 + 400 Bad Request
        """
        await self.send(text_data=json.dumps({"error": "Invalid request format"}))
        await self.close(code=4400)  
        
    async def handle_error(self, e):
        """ code: RFC6455 WebSocket app 4000 + 500 Internal server error """
        await self.send(text_data=json.dumps({"error": "Internal server error", "details": str(e)}))
        await self.close(code=4500)


    async def send_game_state(self, game_state):
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'send_data',
            'data': game_state
        })

    async def send_data(self, event):
        await self.send(text_data=json.dumps(event['data']))

    async def disconnect(self, close_code):
        async with asyncio.Lock():
            await database_sync_to_async(self.redis_client.srem)(self.room_group_name, self.scope["user"].id)
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            await self.clear_redis_room()

    async def clear_redis_room(self):
        await database_sync_to_async(self.redis_client.delete)(self.room_group_name)

    @database_sync_to_async
    def _get_system_user(self):
        return CustomUser.objects.get(is_system=True)
