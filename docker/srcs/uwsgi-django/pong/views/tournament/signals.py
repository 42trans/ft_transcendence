from django.dispatch import Signal

# @receiver(round_finished)によって、イベント発生時に関数を呼び出す
# イベントドリブンプログラミングの一種
# 参考:【シグナル | Django ドキュメント | Django】 <https://docs.djangoproject.com/en/3.2/topics/signals/>
round_finished = Signal()