from django.test import TestCase
from django.contrib.auth import get_user_model


class CustomUserTests(TestCase):
    # test用のDBが作成されるため、super_user, user1, user2を追加する
    kAdminEmail = 'admin@example.com'
    kAdminNickname = 'admin'
    kAdminPassword = 'admin012345'

    kUserPassword = 'pass012345'

    kUser1Email = 'user1@example.com'
    kUser1Nickname = 'user1'

    kUser2Email = 'user2@example.com'
    kUser2Nickname = 'user2'


    def setUp(self):
        User = get_user_model()
        self.super_user = User.objects.create_superuser(email=self.kAdminEmail, nickname=self.kAdminNickname, password=self.kAdminPassword)
        self.user1 = User.objects.create_user(email=self.kUser1Email, nickname=self.kUser1Nickname, password=self.kUserPassword)
        self.user2 = User.objects.create_user(email=self.kUser2Email, nickname=self.kUser2Nickname, password=self.kUserPassword)

    def test_super_user(self):
        self.assertTrue(self.super_user.is_superuser)

    def test_general_user(self):
        self.assertFalse(self.user1.is_superuser)
        self.assertFalse(self.user2.is_superuser)


    def test_user_creation(self):
        self.assertEqual(self.super_user.email, self.kAdminEmail)
        self.assertTrue(self.super_user.check_password(self.kAdminPassword))
        self.assertTrue(self.super_user.is_staff)
        self.assertTrue(self.super_user.is_superuser)
        self.assertFalse(self.super_user.check_password(self.kUserPassword))
        self.assertNotEqual(self.super_user.nickname, self.kUser1Nickname)

        self.assertEqual(self.user1.email, self.kUser1Email)
        self.assertEqual(self.user1.nickname, self.kUser1Nickname)
        self.assertTrue(self.user1.check_password(self.kUserPassword))
        self.assertFalse(self.user1.is_staff)
        self.assertFalse(self.user1.is_superuser)

        self.assertEqual(self.user2.email, self.kUser2Email)
        self.assertEqual(self.user2.nickname, self.kUser2Nickname)
        self.assertTrue(self.user2.check_password(self.kUserPassword))
        self.assertFalse(self.user2.is_staff)
        self.assertFalse(self.user2.is_superuser)


    def test_user_email_unique(self):
        User = get_user_model()
        with self.assertRaises(Exception):
            User.objects.create_user(email=self.kUser1Email, nickname='new', password=self.kUserPassword)


    def test_user_invalid_email(self):
        User = get_user_model()

        invalid_emails = [
            '', 'aaa', '@', '.',
            'aaa.bbb.com',
            'aaa@', 'aaa@@', '@aaa',
            'aaa@bbb', 'aaa@bbb.', 'aaa@.bbb', 'aaa@.', 'aaa@..',
            '@xxx.com',
            'aaa@bbb@ccc',
            'aaa@bbb.com.',
        ]

        for email in invalid_emails:
            with self.assertRaises(ValueError, msg=f"ValueError was not raised for email: [{email}]"):
                User.objects.create_user(email=email, nickname='new', password=self.kUserPassword)


    def test_user_invalid_password(self):
        User = get_user_model()

        invalid_password = [
            '', 'a', 'short', 'a'*10, '0123', '0'*10,
            'username', 'unique@example.com',
            'qwerty', 'password', 'password123'
        ]

        for password in invalid_password:
            with self.assertRaises(ValueError, msg=f"ValueError was not raised for password: [{password}]"):
                User.objects.create_user(email='unique@example.com', nickname='username', password=password)


    def test_user_nickname_unique(self):
        User = get_user_model()
        with self.assertRaises(Exception):
            User.objects.create_user(email='unique@example.com', nickname=self.kUser1Nickname, password=self.kUserPassword)


    def test_user_invalid_nickname(self):
        User = get_user_model()

        invalid_nicknames = [
            '', 'a'*31, '.', '@', '*', ' ', '$',
            '  a',
            'aaa@', 'aaa@@', '@aaa',
            'aaa@bbb', 'aaa@bbb.', 'aaa@.bbb', 'aaa@.', 'aaa@..',
            '@xxx.com',
            'aaa@bbb@ccc',
            'aaa@bbb.com.',
        ]

        for nickname in invalid_nicknames:
            with self.assertRaises(ValueError, msg=f"ValueError was not raised for nickname: [{nickname}]"):
                User.objects.create_user(email='unique1@email.jp', nickname=nickname, password=self.kUserPassword)
