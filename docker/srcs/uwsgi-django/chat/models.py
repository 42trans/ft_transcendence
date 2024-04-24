# chat/models.py

from django.db import models
from shortuuidfield import ShortUUIDField

from accounts.models import CustomUser


def print_blue(text):
    print(f"\033[34m[DEBUG] {text}\033[0m")


class DMSession(models.Model):
    sessionId = ShortUUIDField()
    member = models.ManyToManyField(CustomUser, related_name='chat_sessions')

    def __str__(self):
        members = ', '.join(user.nickname for user in self.member.all())
        return (f"DMSession {self.id} with memberes: {members}")

    @classmethod
    def get_dm_session(cls, user_id: int, other_user_id: int):
        print_blue("get_dm_session: 1")
        user = CustomUser.objects.get(id=user_id)
        other_user = CustomUser.objects.get(id=other_user_id)

        # 両方のユーザーが既に属しているセッションを検索
        sessions = cls.objects.filter(member=user).filter(member=other_user)
        if sessions.exists():
            print_blue("get_dm_session: 2")
            # 既存のセッションがあればそれを返す
            return sessions.first()
        else:
            print_blue("get_dm_session: 3")
            # セッションがなければ新規作成
            session = cls.objects.create()
            session.member.add(user, other_user)
            session.save()
            return session


class Message(models.Model):
    sender = models.ForeignKey(CustomUser,
                               related_name='sent_dm',
                               on_delete=models.CASCADE)
    receiver = models.ForeignKey(CustomUser,
                                 related_name='received_dm',
                                 on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (f"Message from {self.sender_id}"
                f" to {self.receiver_id}"
                f" at {self.timestamp}")
