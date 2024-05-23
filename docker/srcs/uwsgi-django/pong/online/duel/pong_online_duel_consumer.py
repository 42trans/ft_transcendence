# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py
import json
import logging
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import AllowAny, IsAuthenticated
from accounts.models import CustomUser
from .pong_online_duel_game_manager import PongOnlineDuelGameManager
from ...utils.async_logger import async_log
from accounts.models import CustomUser
from chat.models import DMSession, Message
from .consumers import Consumer

# class PongOnlineDuelConsumer(Consumer):
class PongOnlineDuelConsumer(AsyncWebsocketConsumer):
    # permission_classes = [AllowAny]
    permission_classes = [IsAuthenticated]

    async def connect(self):

        # 2名が入室したら合図を送る
        # IDを確認する？

        await async_log("DuelConsumer: ws接続されました")
        if not self.scope["user"].is_authenticated:
            await self.close(code=1008)
            return
        
        try:
            # err = await self._get_duel_consumer_params()
            # if err is not None:
            #     await async_log("eror 1007")
            #     await self.close(code=1007)  # 1007: Invalid data
            #     return
            
            # await async_log("終了: self.user.id: " + str(self.user.id))
            # await async_log("終了: self.other_user.id: " + str(self.other_user.id))

            # http APIに移動
            # await async_log("開始:room_group_name ")
            # self.room_group_name, err = await self._get_room_group_name(
            #                                 self.user.id,
            #                                 self.other_user.id
            #                                 )
            # await async_log("終了:room_group_name " + self.room_group_name)

            try:
                await async_log("開始:group_add ")
                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )
                await async_log("終了:group_add ")
            except Exception as e:
                await self.close(code=1011) 
                return
            
            # await async_log("room_group_nameが作成されました: " + self.room_group_name)
            self.game_manager = PongOnlineDuelGameManager(self.user_id)
            await self.game_manager.initialize_game()
            # await async_log("game_managerが作成されました")

            # ここで対戦相手にDMを送信
            # 別のAPIに任せる
            # game_url = "https://localhost/pong/online/duel/room-name"
            # message = f"Duel invitation. <a href='game_url'>Join now</a>"
            # await self.send_dm_to_user(self.user, self.other_user, message)

            await self.accept()
            await async_log("終了: connect")
        except Exception as e:
            await async_log(f"Error: {str(e)}") 
            await self.close(code=1011)  # 1011: Internal error
            raise e

    @database_sync_to_async
    def send_dm_to_user(self, sender, recipient, message_text):
        session = DMSession.get_session(user_id=sender.id, other_user_id=recipient.id)
        message = Message(
            sender=sender,
            receiver=recipient,
            message=message_text
        )
        message.save()



    # async def _get_duel_consumer_params(self):
    #     self.user, self.other_user, err = await self._get_users()
    #     await async_log("self.user: " + str(self.user))
    #     await async_log("self.other_user: " + str(self.other_user))

    #     if err is not None:
    #         return err
    #     self.is_system_message = self.scope['url_route']['kwargs'].get('is_system_message', False)
    #     return None
    
    # async def _get_users(self):
    #     try:
    #         user_nickname = self.scope['user'].nickname
    #         other_user_nickname = self.scope['url_route']['kwargs']['nickname']

    #         user = await self._get_user_by_nickname(nickname=user_nickname)
    #         await async_log("user: " + str(user))
    #         other_user = await self._get_user_by_nickname(nickname=other_user_nickname)
    #         await async_log("other_user: " + str(other_user))
    #         if user == other_user:
    #             raise ValueError('user and other_user must be a different user')

    #         return user, other_user, None

    #     except CustomUser.DoesNotExist:
    #         await async_log("except Does not:")
    #         err = "user does not exist"
    #         return None, None, err
    #     except Exception as e:
    #         await async_log(f"except e: {e}")
    #         return None, None, str(e)

    @database_sync_to_async
    def _get_user_by_nickname(self, nickname: str):
        return CustomUser.objects.get(nickname=nickname)
    


    # # @database_sync_to_async
    # async def _get_room_group_name(self, user_id, other_user_id=None):
    #     """
    #     SessionModel.get_sessionからroom_group_nameを取得する関数
    #     一人用または二人用のセッションの検索または作成のために使用
    #     other_user_idはオプション
    #     """
    #     try:
    #         if other_user_id:
    #             room_group_name = f"room_{user_id}_{other_user_id}"
    #         else:
    #             room_group_name = f"room_{user_id}"
            
    #         await async_log(f"_get_room_group_name().room_group_name {room_group_name}")
    #         return room_group_name, None
    #     except Exception as e:
    #         return None, str(e)





    async def receive(self, text_data=None):
        """
        """
        # await async_log("receive(): 開始")
        # await async_log("クライアントからのtext_data受信: " + text_data)
        
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
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )



    @database_sync_to_async
    def _get_system_user(self):
        return CustomUser.objects.get(is_system=True)
    
    # @database_sync_to_async
    # def _get_user_by_nickname(self, nickname: str):
    #     return CustomUser.objects.get(nickname=nickname)

    # @database_sync_to_async
    # def get_user_information(self, user_id):
    #     return CustomUser.objects.get(id=user_id)

    # @database_sync_to_async
    # def _get_room_group_name(self, user_id, other_user_id=None):
    #     """
    #     SessionModel.get_sessionからroom_group_nameを取得する関数
    #     一人用または二人用のセッションの検索または作成のために使用
    #     other_user_idはオプション
    #     """
    #     # return "test_room_group", None
    #     try:
    #         if other_user_id:
    #             room_group_name = f"room_{user_id}_{other_user_id}"
    #         else:
    #             room_group_name = f"room_{user_id}"
    #         return room_group_name, None
    #     except Exception as e:
    #         return None, str(e)
