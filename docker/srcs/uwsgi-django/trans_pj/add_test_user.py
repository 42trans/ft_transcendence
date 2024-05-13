import os
import sys
import django
import logging
from pathlib import Path
from django.contrib.auth import get_user_model


sys.path.append(Path(__file__).resolve().parent.parent.__str__())
print (sys.path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trans_pj.settings')
django.setup()


def is_unique_user(User, email: str, nickname: str):
    email_exists = User.objects.filter(email=email).exists()
    nickname_exists = User.objects.filter(nickname=nickname).exists()
    return not email_exists and not nickname_exists


def create_user(User, email: str, nickname: str, password: str, is_system: bool):

    if is_unique_user(User, email, nickname):
        User.objects.create_user(email=email,
                                 nickname=nickname,
                                 password=password,
                                 is_system=is_system)
        print(f"User created -> email: {email}, nickname: {nickname}")
    else:
        print(f"User already exists -> email: {email}, nickname: {nickname}")


def main():
    print(" ----------add_test_user.py ----------")

    User = get_user_model()

    users = [
        {"email": "system@example.com", "password": "pass0123", "nickname": "system", "is_system": True},
        {"email": "user1@example.com", "password": "pass0123", "nickname": "user1", "is_system": False},
        {"email": "user2@example.com", "password": "pass0123", "nickname": "user2", "is_system": False},
        {"email": "user3@example.com", "password": "pass0123", "nickname": "user3", "is_system": False},
    ]
    for user in users:
        create_user(User,
                    email=user["email"],
                    nickname=user["nickname"],
                    password=user["password"],
                    is_system=user["is_system"])

    print(" -------------------------------------")


if __name__ == "__main__":
    main()
