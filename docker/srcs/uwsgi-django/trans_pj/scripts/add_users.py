import time
from django.utils import timezone
from trans_pj.models import TestTable 

def add_user_every_second():
    while True:
        new_user = TestTable(name="New User", created_at=timezone.now())  # フィールドに合わせて変更してください
        new_user.save()
        print(f"Added new user: {new_user.name}")
        time.sleep(1)  # 1秒間待機

if __name__ == "__main__":
    add_user_every_second()
