# tests/test_dm_consumers.py

import json
import traceback
from django.test import TestCase
from django.test import TransactionTestCase
from rest_framework.test import APIClient

from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator

from accounts.models import CustomUser
from chat.dm_consumers import DMConsumer
from chat.models import DMSession, Message
import pytest
from django.test import LiveServerTestCase
from trans_pj.asgi import application
from django.urls import reverse, resolve
from channels.testing import WebsocketCommunicator
from rest_framework import status


class DMConsumerTestCase(TransactionTestCase):
    kUser1Email = 'user1@example.com'
    kUser1Nickname = 'user1'
    kUser1Password = 'pass012345'

    kUser2Email = 'user2@example.com'
    kUser2Nickname = 'user2'
    kUser2Password = 'pass012345'

    async def asyncSetUp(self):
        self.client = APIClient()
        self.user1 = await database_sync_to_async(CustomUser.objects.create_user)(
            email=self.kUser1Email,
            nickname=self.kUser1Nickname,
            password=self.kUser1Password,
            enable_2fa=False
        )
        self.user2 = await database_sync_to_async(CustomUser.objects.create_user)(
            email=self.kUser2Email,
            nickname=self.kUser2Nickname,
            password=self.kUser2Password,
            enable_2fa=False
        )
        await database_sync_to_async(self.user1.save)()
        await database_sync_to_async(self.user2.save)()
        user1_jwt = await self._login(self.kUser1Email, self.kUser1Password)
        self.communicator = self._create_ws_communicator(user1_jwt)

    async def _login(self, email, password):
        login_api_path = reverse("api_accounts:api_login")
        login_data = {'email': email, 'password': password}
        response = await database_sync_to_async(self.client.post)(login_api_path, data=login_data)
        if response.status_code == status.HTTP_200_OK and 'Access-Token' in response.cookies:
            return response.cookies['Access-Token'].value
        else:
            raise ValueError("Failed to retrieve JWT token")

    def _create_ws_communicator(self, user1_jwt):
        token_header = f'Bearer {user1_jwt}'.encode()
        headers = [(b'authorization', token_header)]
        communicator = WebsocketCommunicator(application,
                                             f"ws/dm-with/{self.user2.nickname}/",
                                             headers)
        return communicator

# --------------------------------------------------------------------------
    # test
    # --------------------------------------------------------------------------
    async def test_connect_websocket(self):
        await self.asyncSetUp()  # login
        try:
            # wsに接続
            connected, code = await self.communicator.connect()

            self.assertTrue(connected, f"WebSocket connection failed, code: {code}")
            self.assertEqual(self.communicator.scope['user'], self.user1)

            await self.communicator.disconnect()

        except Exception as e:
            self.fail(f"Unexpected error occurred: {str(e)}")

    async def test_receive_and_store_message(self):
        await self.asyncSetUp()  # login
        try:
            # wsに接続
            connected, code = await self.communicator.connect()
            self.assertTrue(connected, f"WebSocket connection failed, code: {code}")

            # messageを送信
            message_data = {
                'message': 'Hello, user2!'
            }
            await self.communicator.send_json_to(message_data)

            response = await self.communicator.receive_json_from()
            self.assertEqual(response['type'], 'send_data')
            response_data = json.loads(response['data'])

            # messageの各要素を評価
            self.assertEqual(response_data['sender'], self.user1.nickname)
            self.assertEqual(response_data['message'], 'Hello, user2!')
            self.assertIsInstance(response_data['timestamp'], str)
            self.assertFalse(response_data['is_system_message'])

            # DBから取得したmessageの各要素を評価
            message = await database_sync_to_async(Message.objects.last)()
            sender = await database_sync_to_async(lambda: message.sender)()
            receiver = await database_sync_to_async(lambda: message.receiver)()
            self.assertEqual(message.message, 'Hello, user2!')
            self.assertEqual(sender, self.user1)
            self.assertEqual(receiver, self.user2)

            await self.communicator.disconnect()

        except Exception as e:
            self.fail(f"Unexpected error occurred: {str(e)}")

    async def test_invalid_json(self):
        await self.asyncSetUp()  # login
        try:
            # wsに接続
            connected, code = await self.communicator.connect()
            self.assertTrue(connected, f"WebSocket connection failed, code: {code}")

            # invalid_jsonを送信
            await self.communicator.send_to(text_data="invalid json")
            with self.assertRaises(AssertionError):
                await self.communicator.receive_from(timeout=1)

            await self.communicator.disconnect()

        except Exception as e:
            self.fail(f"Unexpected error occurred: {str(e)}")
