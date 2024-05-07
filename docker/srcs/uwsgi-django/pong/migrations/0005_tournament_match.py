# Generated by Django 5.0.2 on 2024-05-06 02:07

import django.contrib.postgres.fields
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0004_alter_ponggameresult_date'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('date', models.DateTimeField(default=django.utils.timezone.now)),
                ('player_nicknames', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=100), default=list, size=None)),
                ('is_finished', models.BooleanField(default=False)),
                ('organizer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tournaments', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('round_number', models.IntegerField()),
                ('match_number', models.IntegerField()),
                ('player1', models.CharField(blank=True, max_length=100)),
                ('player2', models.CharField(blank=True, max_length=100)),
                ('winner', models.CharField(blank=True, max_length=100, null=True)),
                ('ended_at', models.DateTimeField(blank=True, null=True)),
                ('player1_score', models.IntegerField(default=0)),
                ('player2_score', models.IntegerField(default=0)),
                ('is_finished', models.BooleanField(default=False)),
                ('can_start', models.BooleanField(default=False)),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches', to='pong.tournament')),
            ],
        ),
    ]