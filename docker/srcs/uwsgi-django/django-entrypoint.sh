#!/bin/bash

python manage.py makemigrations trans_pj # 必要に応じて
python manage.py migrate --noinput
exec "$@"
