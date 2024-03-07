# docker/srcs/uwsgi-django/trans_pj

from django.db import models

class Sample(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name


class TestTable(models.Model):
    name = models.CharField(max_length=100)