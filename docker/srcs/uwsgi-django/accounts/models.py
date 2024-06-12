from __future__ import annotations
import traceback
import logging
from typing import List, Dict, Any

from django.db import models
from django.conf import settings
from django.contrib import auth
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import PermissionsMixin
from django.db.models import F, Q
from django.utils.timezone import now
from django.utils.translation import gettext_lazy as _
from django_otp.plugins.otp_totp.models import TOTPDevice


logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)
logger = logging.getLogger(__name__)


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """
        Create and save a user with the given email, password, and nickname.
        """
        # ユーザー数の上限チェック
        if settings.MAX_USER_COUNT <= CustomUser.objects.count():
            raise ValueError("User registration limit exceeded.")

        email = self.normalize_email(email)
        nickname = extra_fields.get("nickname")
        ok, err = self._is_valid_user_field(email, nickname, password)
        if not ok:
            raise ValueError(err)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)

        user.save(using=self._db)
        return user

    @classmethod
    def _is_valid_user_field(self, email, nickname, password):
        ok, err = self._is_valid_email(email)
        if not ok:
            return False, err

        ok, err = self._is_valid_nickname(nickname)
        if not ok:
            return False, err

        tmp_user = CustomUser(email=email, nickname=nickname)
        ok, err = self._is_valid_password(password, tmp_user)
        if not ok:
            return False, err

        return True, None


    @classmethod
    def _is_valid_email(self, email):
        if not email:
            return False, "The given email must be set"

        if CustomUser.objects.filter(email=email).exists():
            return False, "This email is already in use"

        # 長さの判定
        if len(email) < CustomUser.kEMAIL_MIN_LENGTH:
            err = f"The email must be at least {CustomUser.kEMAIL_MIN_LENGTH} characters"
            return False, err
        if CustomUser.kEMAIL_MAX_LENGTH < len(email):
            err = f"The email must be {CustomUser.kEMAIL_MAX_LENGTH} characters or less"
            return False, err

        try:
            # local@domainの判定
            # https://docs.djangoproject.com/en/5.0/ref/validators/#emailvalidator
            validate_email(email)
            return True, None
        except ValidationError as e:
            return False, ". ".join(e.messages)


    @classmethod
    def _is_valid_nickname(self, nickname, is_check_exists=True):
        if not nickname:
            return False, "The given nickname must be set"
        if len(nickname) < CustomUser.kNICKNAME_MIN_LENGTH:
            err = f"The nickname must be at least {CustomUser.kNICKNAME_MIN_LENGTH} characters"
            return False, err
        if CustomUser.kNICKNAME_MAX_LENGTH < len(nickname):
            err = f"The nickname must be {CustomUser.kNICKNAME_MAX_LENGTH} characters or less"
            return False, err
        if not nickname.isascii():
            return False, "The nickname can only contain ASCII characters"
        if not nickname.isalnum():
            return False, "Invalid nickname format"

        if is_check_exists and CustomUser.objects.filter(nickname=nickname).exists():
            return False, "This nickname is already in use"

        return True, None


    @classmethod
    def _is_valid_password(self, password, tmp_user):
        if password is None:
            return False, "The password cannot be None"
        if not password:
            return False, "The password cannot be set"
        if CustomUser.kPASSWORD_MAX_LENGTH < len(password):
            err = f"The password must be {CustomUser.kPASSWORD_MAX_LENGTH} characters or less"
            return False, err
        if not password.isascii():
            return False, "The password can only contain ASCII characters"
        try:
            validate_password(password, user=tmp_user)
            return True, None
        except ValidationError as e:
            return False, ". ".join(e.messages)


    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)

    def with_perm(
            self, perm, is_active=True, include_superusers=True, backend=None, obj=None
    ):
        if backend is None:
            backends = auth._get_backends(return_tuples=True)
            if len(backends) == 1:
                backend, _ = backends[0]
            else:
                raise ValueError(
                    "You have multiple authentication backends configured and "
                    "therefore must provide the `backend` argument."
                )
        elif not isinstance(backend, str):
            raise TypeError(
                "backend must be a dotted import path string (got %r)." % backend
            )
        else:
            backend = auth.load_backend(backend)
        if hasattr(backend, "with_perm"):
            return backend.with_perm(
                perm,
                is_active=is_active,
                include_superusers=include_superusers,
                obj=obj,
            )
        return self.none()


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    CustomUser model that extends AbstractBaseUser and PermissionsMixin.

    Fields:
    - email: Email address of the user. 42 email if OAuth with 42 used.
    - nickname: A unique nickname for the user. if OAuth with 42 used, 42-login by default.
    - bloking_users: A list of bloking users
    """
    kNICKNAME_MIN_LENGTH = 3
    kNICKNAME_MAX_LENGTH = 30
    kEMAIL_MIN_LENGTH = 5   # 最小構成: a@b.c
    kEMAIL_MAX_LENGTH = 64  # RFC5321: local@domain, local:max64, domain:max255
    kPASSWORD_MAX_LENGTH = 64
    email = models.EmailField(_("email address"), unique=True)
    nickname = models.CharField(_("nickname"), max_length=kNICKNAME_MAX_LENGTH, unique=True)
    enable_2fa = models.BooleanField(_("enable 2fa"), default=False)
    blocking_users = models.ManyToManyField('self', symmetrical=False, related_name='blocking_me')
    is_system = models.BooleanField(_("is_system"), default=False)  # unused

    # アバター画像フィールドを追加
    avatar = models.ImageField(upload_to='avatars/',
                               default='avatars/default_avatar.jpg',
                               blank=True)

    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can log into this admin site."),
    )

    objects = UserManager()

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nickname"]

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        #abstract = True


    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)


    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send an email to this user."""
        send_mail(subject, message, from_email, [self.email], **kwargs)


    def block_user(self, user_to_block: CustomUser):
        """
        Attempts to add a user to the blocking list.
        Args:
            user_to_block: The user instance to block.
        Raises:
            ValueError: If the user_to_block does not exist.
        Returns:
            None
        """
        # Check if the user is already blocked
        if user_to_block in self.blocking_users.all():
            raise ValueError(f"User {user_to_block.nickname} is already blocked")
        try:
            self.blocking_users.add(user_to_block)
            self.save()

        except Exception as e:
            logger.error(f"Failed to block user: {str(e)}")
            raise ValueError(f"Error: The user does not exist: {str(e)}") from e


    def unblock_user(self, user_to_unblock: CustomUser):
        """
        Attempts to remove a user from the blocking list.
        Args:
            user_to_unblock: The user instance to unblock.
        Raises:
            ValueError: If the user_to_unblock does not exist.
        Returns:
            None
        """
        # Check if the user is blocked
        if user_to_unblock not in self.blocking_users.all():
            raise ValueError(f"User {user_to_unblock.nickname} is not blocked")
        try:
            self.blocking_users.remove(user_to_unblock)
            self.save()
        except Exception as e:
            logger.error(f"Failed to unblock user: {str(e)}")
            raise ValueError(f"Error: The user does not exist: {str(e)}") from e


    def is_blocking_user(self, user: CustomUser) -> bool:
        return user in self.blocking_users.all()


class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    devices = models.ManyToManyField(TOTPDevice)


class Friend(models.Model):
    """
    user間のfriendリクエスト状態を管理
    sender  : 友達申請を送信したuser
    receiver: 友達申請を受信したuser
    """
    class FriendStatus(models.TextChoices):
        PENDING  = 'pending' , _('Pending')
        ACCEPTED = 'accepted', _('Accepted')
        REJECTED = 'rejected', _('Rejected')

    sender = models.ForeignKey(CustomUser,
                               on_delete=models.CASCADE,
                               related_name='friend_requests_sent')
    receiver = models.ForeignKey(CustomUser,
                                 on_delete=models.CASCADE,
                                 related_name='friend_requests_received')
    status = models.CharField(max_length=10,
                              choices=FriendStatus.choices,
                              default=FriendStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        print(f"Saving Friend: sender={self.sender}, receiver={self.receiver}")
        if self._state.adding:  # 新規作成の場合の場合に重複チェック
            if (Friend.objects.filter(sender=self.sender, receiver=self.receiver).exists()
                    or Friend.objects.filter(sender=self.receiver, receiver=self.sender).exists()):
                print("Duplicate friend request detected")
                raise ValidationError('Duplicate friend request')
        super(Friend, self).save(*args, **kwargs)

    @classmethod
    def is_friend(cls, user1, user2) -> bool:
        """
        user1, user2 がすでに友達関係であるか確認
        """
        return cls.objects.filter(
            Q(sender=user1, receiver=user2) | Q(sender=user2, receiver=user1),
            status=cls.FriendStatus.ACCEPTED
        ).exists()

    @classmethod
    def is_already_sent(cls, sender, receiver) -> bool:
        """
        送信者が受信者に送ったリクエストがPending状態にあるか確認
        """
        return cls.objects.filter(sender=sender,
                                  receiver=receiver,
                                  status=cls.FriendStatus.PENDING).exists()

    @classmethod
    def is_already_received(cls, sender, receiver) -> bool:
        """
        受信者が送信者からのリクエストをPending状態で受けているか確認
        """
        return cls.objects.filter(sender=receiver,
                                  receiver=sender,
                                  status=cls.FriendStatus.PENDING).exists()

    @classmethod
    def get_friends_as_sender(cls, user, status) -> List[Dict[str, Any]]:
        """
        userが送信したフレンドリクエストのうち、statusが一致するものを取得
        key: nickname, friend_id
        """
        return list(cls.objects.filter(
            sender=user,
            status=status
        ).annotate(
            nickname=F('receiver__nickname'),
            friend_id=F('receiver_id')
        ).values(
            'nickname', 'friend_id'
        ).order_by('nickname'))

    @classmethod
    def get_friends_as_receiver(cls, user, status) -> List[Dict[str, Any]]:
        """
        userが受信したフレンドリクエストのうち、statusが一致するものを取得
        key: nickname, friend_id
        """
        return list(cls.objects.filter(
            receiver=user,
            status=status
        ).annotate(
            nickname=F('sender__nickname'),
            friend_id=F('sender_id')
        ).values(
            'nickname', 'friend_id'
        ).order_by('nickname'))


class UserStatus(models.Model):
    """
    userのオンラインステータスを追跡するモデル
    """
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    is_online = models.BooleanField(default=False)
    last_online = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.user.username} is {'online' if self.is_online else 'offline'}"
