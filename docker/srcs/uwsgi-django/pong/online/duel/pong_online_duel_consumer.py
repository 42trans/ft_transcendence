# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py
import json
import logging
import asyncio
from channels.db import database_sync_to_async
# from channels.generic.websocket import AsyncJsonWebsocketConsumer
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

# redis_client = redis.Redis(host=redis_host, port=redis_port)

class PongOnlineDuelConsumer(AsyncWebsocketConsumer):
    '''
    参考:【チャンネル レイヤー — Channels 4.0.0 ドキュメント】 <https://channels.readthedocs.io/en/stable/topics/channel_layers.html>
    '''
    permission_classes = [IsAuthenticated]

    async def connect(self):
        try:
            await async_log("開始:connect() ")

            # ユーザーがログインしていることを確認
            if not self.scope["user"].is_authenticated:
                await self.close(code=1008)
                return
            
            # ルーム名を取得
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'duel_room_{self.room_name}'
            # URLからuser_idとother_user_idを抽出
            path_segments = self.scope['url_route']['kwargs']['room_name'].split('_')
            user_id, other_user_id = int(path_segments[1]), int(path_segments[2])
            # 現在のユーザーIDを取得
            current_user_id = self.scope["user"].id

             # ユーザーIDが一致しない場合は接続を拒否
            if (
                (current_user_id != user_id and current_user_id != other_user_id) 
            ):
                await async_log(f"無効なユーザーID: current_user_id:{current_user_id}, user_id:{user_id}")
                await self.close()
                return


            await async_log("開始:redis ")
            # Redis への接続をリトライ
            for _ in range(5):  # 最大5回リトライ (適宜調整)
                try:
                    await async_log(f"接続ユーザーID: {current_user_id}")
                    self.redis_client = redis.Redis(host=redis_host, port=redis_port)
                    added = await database_sync_to_async(self.redis_client.sadd)(self.room_group_name, current_user_id)


                    # exists = await database_sync_to_async(self.redis_client.sismember)(self.room_group_name, current_user_id)
                    # if exists:
                    #     await async_log(f"ユーザー {current_user_id} は既に存在します")
                    # else:
                    #     added = await database_sync_to_async(self.redis_client.sadd)(self.room_group_name, current_user_id)
                    #     if not added:
                    #         await async_log(f"ユーザー {current_user_id} を追加できませんでした")
                    
                    members = await database_sync_to_async(self.redis_client.smembers)(self.room_group_name)
                    await async_log(f"セットのメンバー: {members}")


                    if not added:
                        await async_log(f"ユーザーは既にルームにいます: {current_user_id}")
                        await self.close()
                        return
                    break  # 接続成功
                except redis.exceptions.ConnectionError:
                    await async_log("Redis への接続に失敗しました。リトライします...")
                    await asyncio.sleep(1)  # 1秒待機 (適宜調整)
            else:
                await async_log("Redis への接続に失敗しました。")
                await self.close(code=1011)  # サーバーエラー
                return
            await async_log("終了:redis ")
            
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await async_log(f"使用するセット名: {self.room_group_name}")
            await async_log("終了:group_add ")
        except Exception as e:
            await async_log(f"Error: {str(e)}") 
            await self.close(code=1011) 
            return
        
        await self.accept()
        await async_log(f'DuelConsumer: ws接続されました{self.scope["user"]}')

        # 接続されているユーザー数を取得
        try:
            # client_count = await self.redis_client.scard(self.room_group_name)
            client_count = await database_sync_to_async(self.redis_client.scard)(self.room_group_name)
            await async_log(f"開始: 人数を数える {client_count}")
        except Exception as e:
            await async_log(f"Redis operation error: {str(e)}")
            await self.close(code=1011)
            return

        # client_count = await self.redis_client.scard(self.room_group_name)
            
        await async_log(f"開始: 人数を数える {client_count}")
        # 2人揃ったらゲーム開始の合図を送信
        if client_count == 2: 
            try:
                await async_log("2名がinしました")
                self.game_manager = PongOnlineDuelGameManager()
                # self.game_manager = PongOnlineDuelGameManager(self.user_id)
                await self.game_manager.initialize_game()
                # await async_log("game_managerが作成されました")
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'duel.ready',
                    }
                )
            except Exception as e:
                await async_log(f"Error: {str(e)}")
                await self.close(code=1011) 
                return
        else:  # まだ1人目の場合
            await self.send(text_data=json.dumps({
                'type': 'duel.waiting_opponent',
                'message': 'Incoming hotshot! Better get your game face on...'
            }))

        await async_log("終了: connect()処理が正常終了")


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
        """
        """
        await async_log("receive(): 開始")
        await async_log("クライアントからのtext_data受信: " + text_data)
        
        try:
            # text_data（WebSocket から受け取った生の文字列データ）を jsonに変換
            json_data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.close(code=1007)
            return

        try:
            # 2名からのスタートボタンのシグナルをもらったらボールサーブ
            if 'action' in json_data and json_data['action'] == 'initialize':
                # json: key==actionのみ
                await async_log("初回クライアントからの受信: " + json.dumps(json_data))
                initial_state = self.game_manager.pong_engine_data

                # json: key==全て(game_settingsを含む)
                await async_log("初回engine_data: " + json.dumps(initial_state))
                await self.send(text_data=json.dumps(initial_state))

            elif 'action' in json_data and json_data['action'] == 'reconnect':
                # await async_log("再接続時の処理----")
                # json: key==全て(game_settingsを含む)
                await async_log("再接続時: クライアントからの受信: " + json.dumps(json_data))
                await self.game_manager.restore_game_state(json_data)
                restored_state = self.game_manager.pong_engine_data
                
                # json: key==全て(game_settingsを含む)
                await async_log("再接続時: engine_data: " + json.dumps(restored_state))

                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'send_data',
                    'data': restored_state
                })

            elif 'action' in json_data and json_data['action'] == 'update':
            # elif 'objects' in json_data:

                # json: key==全て(game_settingsを含む)
                await async_log("更新時クライアントからの受信: " + json.dumps(json_data))

                await self.game_manager.update_game(json_data['objects'])
                updated_state = self.game_manager.pong_engine_data

                # json: key==全て(game_settingsを含む)
                await async_log("更新時engine_data: " + json.dumps(updated_state))

                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'send_data',
                    'data': updated_state
                })
            else:
                # 期待されるキーが含まれていない場合
                await self.send(text_data=json.dumps({"error": "Invalid request format"}))\
                # カスタム: RFC6455 WebSocket app 4000 + 400 Bad Request
                await self.close(code=4400)  
        except Exception as e:
            await self.send(text_data=json.dumps({"error": "Internal server error", "details": str(e)}))
            # カスタム: RFC6455 WebSocket app 4000 + 500 Internal server error
            await self.close(code=4500) 
    
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
    