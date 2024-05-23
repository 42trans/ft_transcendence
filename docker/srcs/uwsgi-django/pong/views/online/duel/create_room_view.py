from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View
from django.http import JsonResponse
# from ....models import GameRoom, CustomUser
from ....models import CustomUser
from chat.models import DMSession, Message
from rest_framework import status
from asgiref.sync import sync_to_async
import json
from channels.db import database_sync_to_async
from ....utils.async_logger import async_log
from django.utils.html import format_html

# TODO_ft:Serializerでvalidationかける
# TODO_ft:csrf_exempt削除

class CreateRoomView(LoginRequiredMixin, View):
    async def post(self, request, *args, **kwargs):
        try:
            # クライアント側から送られてくるように実装する。bodyに入れる
            data = json.loads(request.body)  # JSONデータを読み込む
            other_user_nickname = data.get('other_user_nickname') 
            print(f"other_user_nickname {other_user_nickname}")
            if not other_user_nickname:
                return JsonResponse({'error': 'Nickname is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            self.other_user = await sync_to_async(self._get_user_by_nickname)(other_user_nickname)
            if not self.other_user:
                return JsonResponse({'error': 'Target user not found'}, status=status.HTTP_404_NOT_FOUND)
            
            room_group_name, err = self._get_room_group_name(self.request.user.id, self.other_user.id)
            if err:
                return JsonResponse({'error': err}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # 対戦ルームURLへのリンクを双方にDM送信
            await self.send_duel_invitations(request, room_group_name)

            return JsonResponse({'room_name': room_group_name}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    async def send_duel_invitations(self, request, room_group_name):
        system_user = await sync_to_async(CustomUser.objects.get)(email='system@example.com')
        duel_room_url = f"/pong/online/duel/room/{room_group_name}/"
        # 招待者へのメッセージ (request.user)
        message_text = format_html(
            "🏓⚔️🏓 Duel challenge sent to {user_name} ! <a href='{url}'>Join</a>",
            user_name=self.other_user.nickname,
            url=duel_room_url
        )
        await self.send_dm_to_user(system_user, request.user, message_text)

        # 被招待者へのメッセージ (self.other_user)
        message_text = format_html(
            "🏓⚔️🏓 Duel request from {user_name}! <a href='{url}'>Accept</a>",
            user_name=request.user.nickname,
            url=duel_room_url
        )
        await self.send_dm_to_user(system_user, self.other_user, message_text)


    @database_sync_to_async
    def send_dm_to_user(self, sender, recipient, message_text):
        session = DMSession.get_session(user_id=sender.id, other_user_id=recipient.id)
        message = Message(
            sender=sender,
            receiver=recipient,
            message=message_text
        )
        message.save()

    def _get_user_by_nickname(self, nickname: str):
        try:
            return CustomUser.objects.get(nickname=nickname)
        except CustomUser.DoesNotExist:
            return None

    def _get_room_group_name(self, user_id, other_user_id=None):
        try:
            if other_user_id:
                sorted_ids = sorted([user_id, other_user_id])
                room_group_name = f"room_{sorted_ids[0]}_{sorted_ids[1]}"
            else:
                room_group_name = f"room_{user_id}"
            return room_group_name, None
        except Exception as e:
            return None, str(e)

