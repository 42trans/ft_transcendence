from django.db import models

# Create your models here.
from django.db import models

class MyModel(models.Model):
    # フィールドの定義
    name = models.CharField(max_length=100)
