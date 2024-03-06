#!/bin/bash

python manage.py makemigrations mysite # 必要に応じて
# python manage.py migrate --noinput
exec "$@"
