# docker/srcs/uwsgi-django/pong/online/tests/test_pong_online_consumer.py
import logging
import json
# import traceback
from django.test import TestCase
from django.test import TransactionTestCase
from rest_framework.test import APIClient
from channels.testing import WebsocketCommunicator, ChannelsLiveServerTestCase
from channels.db import database_sync_to_async

from accounts.models import CustomUser
from django.test import LiveServerTestCase
from trans_pj.asgi import application
from django.urls import reverse
from rest_framework import status

# ロガーの設定
logger = logging.getLogger(__name__)

class TestPongOnlineConsumer(ChannelsLiveServerTestCase):
    kUser1Email = 'user1@example.com'
    kUser1Nickname = 'user1'
    kUser1Password = 'pass012345'

    # async def setUp(self):
    async def asyncSetUp(self):
        super().setUp()
        # await super().asyncSetUp()
        # テスト用にユーザーを作成してデータベースに登録
        self.client = APIClient()
        self.user1 = await database_sync_to_async(CustomUser.objects.create_user)(
            email=self.kUser1Email,
            nickname=self.kUser1Nickname,
            password=self.kUser1Password,
            enable_2fa=False
        )
        await database_sync_to_async(self.user1.save)()
        # JWTトークンを取得
        self.user1_jwt = await self._login(self.kUser1Email, self.kUser1Password)
        # WebSocket通信用のコミュニケータを設定
        self.communicator = await self._create_ws_communicator(self.user1_jwt)
        connected, _ = await self.communicator.connect()
        self.assertTrue(connected, msg="WebSocket connection failed")

    async def asyncTearDown(self):
        # テスト終了時にWebSocket接続を閉じる
        await self.communicator.disconnect()

    async def _login(self, email, password):
        login_api_path = reverse("api_accounts:api_login")
        login_data = {'email': email, 'password': password}
        response = await database_sync_to_async(self.client.post)(login_api_path, data=login_data)
        if response.status_code == status.HTTP_200_OK and 'Access-Token' in response.cookies:
            return response.cookies['Access-Token'].value
        else:
            logger.error("Failed to retrieve JWT token")
            raise ValueError("Failed to retrieve JWT token")

    async def _create_ws_communicator(self, user1_jwt):
        token_header = f'Bearer {user1_jwt}'.encode()
        headers = [(b'authorization', token_header)]
        communicator = WebsocketCommunicator(application, '/ws/pong/online/', headers)
        return communicator
    
    async def send_and_receive_message(self, message):
        await self.communicator.send_json_to(message)
        return await self.communicator.receive_json_from()


    # --------------------------------------------------------------------------
    # test
    # --------------------------------------------------------------------------

    async def test_websocket_connection_authenticated(self):
        await self.asyncSetUp()
        # JWTトークンを使用して認証されたユーザーでWebSocket接続を試みる
        connected, _ = await self.communicator.connect()
        self.assertTrue(connected, "Authenticated user should connect successfully")
        await self.communicator.disconnect()


    async def test_initial_communication(self):
        await self.asyncSetUp()
        # サーバーへ クライアント側から初期化リクエストを送信
        await self.communicator.send_json_to({'action': 'initialize'})
        # クライアントへ サーバーからの初期状態応答を受信
        response = await self.communicator.receive_json_from()

        expected_initial_state = {"score1": 0, "score2": 0}
        actual_scores = response['state']

        # 応答データの検証
        self.assertEqual(actual_scores, expected_initial_state, "Scores did not match expected scores.")
        await self.communicator.disconnect()


    async def test_game_state_update(self):
        await self.asyncSetUp()
        # ゲームの状態更新リクエスト
        update_data = {
            "objects": {
                "ball": {"position": {"x": 100, "y": 150}, "direction": {"x": 1, "y": 1}, "speed": 2, "radius": 5},
                "paddle1": {"position": {"x": 50, "y": 50}, "dir_y": 1, "speed": 10},
                "paddle2": {"position": {"x": 50, "y": 200}, "dir_y": -1, "speed": 10}
            }
        }
        await self.communicator.send_json_to(update_data)

        # 更新されたゲーム状態を受信
        updated_data = await self.communicator.receive_json_from()

        # 更新後のデータ検証
        assert "objects" in updated_data, "The key 'objects' is missing in the response"
        assert "ball" in updated_data["objects"], "The key 'ball' is missing in the response"
        assert "position" in updated_data["objects"]["ball"], "The key 'position' is missing for 'ball'"
        assert "direction" in updated_data["objects"]["ball"], "The key 'direction' is missing for 'ball'"
        assert "paddle1" in updated_data["objects"], "The key 'paddle1' is missing in the response"
        assert "position" in updated_data["objects"]["paddle1"], "The key 'position' is missing for 'paddle1'"
        assert "paddle2" in updated_data["objects"], "The key 'paddle2' is missing in the response"
        assert "position" in updated_data["objects"]["paddle2"], "The key 'position' is missing for 'paddle2'"

        await self.communicator.disconnect()