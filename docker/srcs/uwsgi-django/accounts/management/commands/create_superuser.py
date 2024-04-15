import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Creates a superuser account from environment variables'

    def handle(self, *args, **options):
        User = get_user_model()

        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        nickname = username

        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(email=email, password=password, nickname=nickname)
            self.stdout.write(self.style.SUCCESS(f'Successfully created superuser: {email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Superuser with email {email} already exists.'))
            # self.stdout.write(self.style.WARNING(f'Superuser with email {email} already exists.'))
