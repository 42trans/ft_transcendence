# docker/srcs/uwsgi-django/pong/online/tests/test_pong_online_consumer.py
import logging
import json
# import traceback
from django.test import TestCase
from django.test import TransactionTestCase
from rest_framework.test import APIClient
from channels.testing import WebsocketCommunicator
from channels.db import database_sync_to_async

from accounts.models import CustomUser
# from django.test import LiveServerTestCase
from trans_pj.asgi import application
from django.urls import reverse
from rest_framework import status

# ロガーの設定
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

class TestPongOnlineConsumer(TransactionTestCase):
    kUser1Email = 'user1@example.com'
    kUser1Nickname = 'user1'
    kUser1Password = 'pass012345'

    # async def setUp(self):
    async def asyncSetUp(self):
        logger.debug("Setting up the test case")
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
        logger.debug("Logging in user")
        login_api_path = reverse("api_accounts:api_login")
        login_data = {'email': email, 'password': password}
        response = await database_sync_to_async(self.client.post)(login_api_path, data=login_data)
        if response.status_code == status.HTTP_200_OK and 'Access-Token' in response.cookies:
            logger.debug("Login successful")
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

    async def test_websocket_connection(self):
        await self.asyncSetUp()
        try:
            # クライアントからゲーム更新コマンドを送信
            message = {"paddle1": {"dir_y": 10}}
            await self.communicator.send_json_to(message)
            # サーバーからのゲーム状態更新を受け取る
            response = await self.communicator.receive_json_from()

            self.assertIn("ball", response)
            self.assertIn("paddle1", response)
            self.assertIn("paddle2", response)
        finally:
            await self.asyncTearDown()


    async def test_send_and_receive_message(self):
        await self.asyncSetUp()
        try:
            message = {"paddle1": {"dir_y": 10}}
            await self.communicator.send_json_to(message)

            response = await self.communicator.receive_json_from()

            self.assertIn("ball", response)
            self.assertIn("paddle1", response)
            self.assertIn("paddle2", response)
        finally:
            await self.asyncTearDown()
    
    async def test_send_invalid_data(self):
        await self.asyncSetUp()
        try:
            invalid_message = "this is not a JSON message"
            await self.communicator.send_to(text_data=invalid_message)
            # 無効なデータ送信後に接続が閉じられることを確認
            with self.assertRaises(AssertionError):
                await self.communicator.receive_from()
        finally:
            await self.asyncTearDown()
    
    async def test_disconnect(self):
        await self.asyncSetUp()
        try:
            await self.communicator.disconnect()
            # wait() should return True, indicating the connection is closed
            closed = await self.communicator.wait(timeout=1)
            self.assertIsNone(closed, "WebSocket connection should be closed")
        finally:
            await self.asyncTearDown()
