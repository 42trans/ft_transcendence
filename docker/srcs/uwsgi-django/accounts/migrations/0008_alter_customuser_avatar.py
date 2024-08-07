# Generated by Django 5.0.2 on 2024-05-08 09:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_customuser_avatar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='avatar',
            field=models.ImageField(blank=True, default='avatars/default_avatar.jpg', upload_to='avatars/'),
        ),
    ]
