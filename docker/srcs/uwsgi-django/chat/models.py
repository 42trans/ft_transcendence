# chat/models.py

import logging

from django.core.validators import MaxLengthValidator
from django.db import models
from shortuuidfield import ShortUUIDField

from accounts.models import CustomUser


logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)

logger = logging.getLogger('chat')


class DMSession(models.Model):
    """
    user間のDMSessionの定義
    sessionは、DMをやり取りするuser1, user2のobjectをkeyとする
    """
    sessionId = ShortUUIDField()
    member = models.ManyToManyField(CustomUser, related_name='dm_sessions')

    # システムメッセージフラグ, todo: unused
    is_system_message = models.BooleanField(default=False)

    def __str__(self):
        members = ', '.join(user.nickname for user in self.member.all())
        return (f"DMSession {self.id} with memberes: {members}")

    @classmethod
    def get_session(cls,
                    user_id: int,
                    other_user_id: int,
                    is_system_message: bool =False):
        user = CustomUser.objects.get(id=user_id)
        other_user = CustomUser.objects.get(id=other_user_id)

        # 両方のユーザーが既に属しているセッションを検索
        sessions = cls.objects.filter(member=user).filter(member=other_user)
        if sessions.exists():
            # 既存のセッションがあればそれを返す
            session = sessions.first()
            # logger.debug(f'[DMSession]: session exists: {session.id}')
            return session
        else:
            # セッションがなければ新規作成
            session = cls.objects.create()
            session.member.add(user, other_user)
            session.save()
            # logger.debug(f'[DMSession]: session created: {session.id}')
            return session


class Message(models.Model):
    """
    DBに保存するDMの定義
    sender    : send userのobject
    receiver  : receive userのobject
    message   : 1送信分のmessage text（max len=128）
    timestamp : messageを送信した日時情報
    """
    kMessageMaxLength = 128

    sender = models.ForeignKey(CustomUser,
                               related_name='sent_dm',
                               on_delete=models.CASCADE)
    receiver = models.ForeignKey(CustomUser,
                                 related_name='received_dm',
                                 on_delete=models.CASCADE)
    message = models.TextField(validators=[MaxLengthValidator(kMessageMaxLength)])
    timestamp = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # メッセージの長さを検証し、保存
        if self.kMessageMaxLength < len(self.message):
            raise ValidationError(f'Message must be less than {self.kMessageMaxLength} characters')
        super().save(*args, **kwargs)

    def __str__(self):
        return (f"Message from {self.sender}"
                f" to {self.receiver}"
                f" at {self.timestamp}")
