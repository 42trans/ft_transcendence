from django.db import models

class PongGameResult(models.Model):
    # フィールドの定義
    match_id = models.IntegerField()
    player_1_score = models.IntegerField()
    player_2_score = models.IntegerField()
    name_winner = models.CharField(max_length=100)
    name_loser = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)

