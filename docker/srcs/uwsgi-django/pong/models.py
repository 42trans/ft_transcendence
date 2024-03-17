# docker/srcs/uwsgi-django/pong/models.py
from django.db import models

# DBのテーブルはこれに行を足してもらえば、あとはDjangoがやります（サンプル動作してます）。
class PongGameResult(models.Model):
    # フィールドの定義
    match_id = models.IntegerField()
    player_1_score = models.IntegerField()
    player_2_score = models.IntegerField()
    name_winner = models.CharField(max_length=100)
    name_loser = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)

# あとはこんな感じの呼び出しで、とあるURL（第一引数）にきたPOSTは、指定の関数（第二引数、処理内容はDBに保存する）が動く
# path('api/save_game_result/', views.save_game_result, name='save_game_result'),
# この関数自体は一関数25行程度なので、気楽に増やしちゃっていいと思います。
# 必要性がよくわからない時は、とりあえずデータ入れちゃって、取り出す時に「選ぶ」とかで良いのかもしれない。
