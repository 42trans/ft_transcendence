# Generated by Django 5.0.2 on 2024-06-21 17:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0007_tournament_last_finished_round'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='last_finished_round',
            field=models.IntegerField(default=-1),
        ),
    ]