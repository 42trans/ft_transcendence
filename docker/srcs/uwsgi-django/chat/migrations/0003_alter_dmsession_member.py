# Generated by Django 5.0.2 on 2024-05-05 23:54

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_dmsession_is_system_message'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='dmsession',
            name='member',
            field=models.ManyToManyField(related_name='dm_sessions', to=settings.AUTH_USER_MODEL),
        ),
    ]
