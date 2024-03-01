from django.core.management.base import BaseCommand
from django.db import transaction
from trans_pj.models import Sample
from django.utils import timezone

class Command(BaseCommand):
    help = 'Adds 10 new Sample instances'

    def handle(self, *args, **options):
        with transaction.atomic():
            for i in range(10):
                Sample.objects.create(
                    name=f'Test Sample {i}',
                    description=f'This is a test sample created at {timezone.now()}'
                )
            self.stdout.write(self.style.SUCCESS(f'10 new samples added at {timezone.now()}'))
