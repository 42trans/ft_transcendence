# tests/test_dm_consumers.py

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
        self.user1_jwt = await self._login(self.kUser1Email, self.kUser1Password)

    async def _login(self, email, password):
        login_api_path = reverse("api_accounts:api_login")
        login_data = {'email': email, 'password': password}
        response = await database_sync_to_async(self.client.post)(login_api_path, data=login_data)
        if response.status_code == status.HTTP_200_OK and 'Access-Token' in response.cookies:
            return response.cookies['Access-Token'].value
        else:
            raise ValueError("Failed to retrieve JWT token")

    # --------------------------------------------------------------------------
    # test

    async def test_connect_websocket(self):
        await self.asyncSetUp()
        try:
            token_header = f'Bearer {self.user1_jwt}'.encode()
            headers = [(b'authorization', token_header)]
            communicator = WebsocketCommunicator(application, f"ws/dm-with/{self.user2.nickname}/", headers)
            connected, code = await communicator.connect()
        except Exception as e:
            self.fail(f"Unexpected error occurred: {str(e)}")

        self.assertTrue(connected, f"WebSocket connection failed, code: {code}")
        self.assertEqual(communicator.scope['user'], self.user1)

        await communicator.disconnect()
