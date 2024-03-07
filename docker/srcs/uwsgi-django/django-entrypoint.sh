#!/bin/bash

python manage.py migrate --noinput
# superuserの作成 データベースに格納される。作成に失敗しても進む。
# uwsgi-django/.envを参照
python manage.py createsuperuser --no-input || true 
exec "$@"
