# chat/models.py

from django.db import models
from shortuuidfield import ShortUUIDField

from accounts.models import CustomUser


def print_blue(text):
    print(f"\033[34m[DEBUG] {text}\033[0m")


class DMSession(models.Model):
    """
    user間のDMSessionの定義
    sessionは、DMをやり取りするuser1, user2のobjectをkeyとする
    """
    sessionId = ShortUUIDField()
    member = models.ManyToManyField(CustomUser, related_name='chat_sessions')
    is_system_message = models.BooleanField(default=False)  # システムメッセージフラグ

    def __str__(self):
        members = ', '.join(user.nickname for user in self.member.all())
        return (f"DMSession {self.id} with memberes: {members}")

    @classmethod
    def get_dm_session(cls,
                       user_id: int,
                       other_user_id: int,
                       is_system_message: bool =False):
        print_blue("get_dm_session: 1")
        user = CustomUser.objects.get(id=user_id)
        other_user = CustomUser.objects.get(id=other_user_id)

        # 両方のユーザーが既に属しているセッションを検索
        sessions = cls.objects.filter(member=user).filter(member=other_user)
        if sessions.exists():
            print_blue("get_dm_session: 2 (DM)")
            # 既存のセッションがあればそれを返す
            return sessions.first()
        else:
            print_blue("get_dm_session: 3 (DM)")
            # セッションがなければ新規作成
            session = cls.objects.create()
            session.member.add(user, other_user)
            session.save()
            return session


class Message(models.Model):
    """
    DBに保存するDMの定義
    sender    : send userのobject
    receiver  : receive userのobject
    message   : 1送信分のmessage text
    timestamp : messageを送信した日時情報
    """
    sender = models.ForeignKey(CustomUser,
                               related_name='sent_dm',
                               on_delete=models.CASCADE)
    receiver = models.ForeignKey(CustomUser,
                                 related_name='received_dm',
                                 on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (f"Message from {self.sender}"
                f" to {self.receiver}"
                f" at {self.timestamp}")
