#!/bin/bash
# docker/srcs/uwsgi-django/django-entrypoint.sh

python manage.py migrate --noinput
# superuserの作成 データベースに格納される。作成に失敗しても進む。
# uwsgi-django/.envを参照
python manage.py createsuperuser --no-input || true 

# register superuser
python manage.py create_superuser


# 全部の"static/"から、ルートのstatic/に集める
python manage.py collectstatic --noinput

exec "$@"
