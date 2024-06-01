# docker/srcs/uwsgi-django/pong/online/pong_online_consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.permissions import IsAuthenticated
from .pong_online_game_manager import PongOnlineGameManager
from .pong_online_consumer_action_handler import PongOnlineConsumerActionHandler
from ..utils.async_logger import async_log

# asyn_log: docker/srcs/uwsgi-django/pong/utils/async_log.log
DEBUG_FLOW = 1
DEBUG_DETAIL = 0

class PongOnlineConsumer(AsyncWebsocketConsumer):
    # permission_classes = [IsAuthenticated]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_manager = None
        self.action_handler = None

    # ---------------------------------------------------
    # connect
    # ---------------------------------------------------
    async def connect(self):
        """
         - _get_room_group_name: ルームグループ名をuser IDから決定
         - self.channel_layer.group_add: ルームグループ名とチャンネル名を使ってルームグループに参加
         - self.channel_layer.group_add:複数の WebSocket 接続に対してメッセージを一斉に配信
         - self.channel_name: AsyncWebsocketConsumerの属性 unique ID
         - self.accept(): WebSocket接続を受け入れて送受信可能にする
        """
        if DEBUG_FLOW:
            await async_log("開始: connect()")
        try:
            # TODO_ft:Userのみに限定するならばチェクが必要。その際はメッセージを送り、クライアント側でログインページへ誘導する処理を実装しなければならない
            # ユーザー認証の確認: permission_classes = [IsAuthenticated]では不足のため
            # if not self.scope["user"].is_authenticated:
            #     await self.close(code=1008)
            #     return False
            self.user_id = self.scope['user'].id
            # ブロードキャストするルームの識別子の作成
            self.room_group_name, err = await self._build_room_group_name(self.user_id)
            if err:
                raise Exception(err)
            # グループに接続userを追加
            await self._join_room_group()
            # インスタンス作成
            self.game_manager = PongOnlineGameManager(self, self.user_id)
            await self.game_manager.initialize_game()
            self.action_handler = PongOnlineConsumerActionHandler(self, self.game_manager)
            # ws接続の開始
            await self.accept()
        except Exception as e:
            await async_log(f"connect() failed {e}")
            await self.close(code=1011) 
            return
        if DEBUG_FLOW:
            await async_log("終了: connect(): ws接続されました")


    async def _build_room_group_name(self, user_id):
        if DEBUG_FLOW:
            await async_log(f"_build_room_group_name(): user_id: {user_id}")
        try:
            room_group_name = f"room_{user_id}"
            return room_group_name, None
        except Exception as e:
            return None, str(e)


    async def _join_room_group(self):
        """
        channelsのルームグループに追加する
        - room_group_name: ブロードキャストでメッセージが送信されるグループ
        - channel_name: 各ユーザーにメッセージを送る先, メールアドレスのようなもの
        """
        if DEBUG_FLOW:
            await async_log(f"_join_room_group(): {self.room_group_name}")
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
    # ---------------------------------------------------
    # receive
    # ---------------------------------------------------
    async def receive(self, text_data=None):
        """
        クライアントからのメッセージ受信時の処理
        
        # Status Code:
        - 4400: RFC6455 WebSocket app 4000 + 400 Bad Request
        - 4500: RFC6455 WebSocket app 4000 + 500 Internal server error
        -  参考:【RFC 6455 - The WebSocket Protocol】 <https://datatracker.ietf.org/doc/html/rfc6455#section-7.4.2>
        """
        if DEBUG_DETAIL:
            await async_log("開始: receive()")
            await async_log("クライアントからのtext_data受信: " + text_data)
        try:
            json_data = json.loads(text_data)
            action = json_data.get('action')
            # クライアントから受信したメッセージの種類で処理を分岐
            if action == 'initialize':
                await self.action_handler.init_handler()
            elif action == 'reconnect':
                await self.action_handler.reconnect_handler(json_data)
            elif action == 'update':
                await self.action_handler.update_handler(json_data)
            else:
                await self.send(text_data=json.dumps({"error": "Invalid request format"}))
                await self.close(code=4400)  
        except Exception as e:
            await self.send(text_data=json.dumps({"error": "Internal server error", "details": str(e)}))
            await self.close(code=4500) 
        if DEBUG_DETAIL:
            await async_log("終了: receive()")


    async def send_data(self, event):
        await self.send(text_data=json.dumps(event['data']))
    # ---------------------------------------------------
    # disconnect
    # ---------------------------------------------------
    async def disconnect(self):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
