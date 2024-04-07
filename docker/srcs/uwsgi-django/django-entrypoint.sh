#!/bin/bash
# docker/srcs/uwsgi-django/django-entrypoint.sh

set -o errexit
set -o nounset
set -o pipefail


# PostgreSQLサーバーが起動するまで待機
i=30
while [ $i -gt 0 ]; do
    if pg_isready -h postgres -p 5432; then
        break
    fi
    echo "Waiting for PostgreSQL to become available..."
    sleep 1
    i=$(( i - 1 ))
done
if [ $i -eq 0 ]; then
    echo >&2 'PostgreSQL did not start'
    exit 1
fi
echo "PostgreSQL is available. Continuing with database migrations."


python manage.py migrate --noinput

# register superuser
python manage.py create_superuser

# register init user
python /code/trans_pj/add_test_user.py

# 全部の"static/"から、ルートのstatic/に集める
python manage.py collectstatic --noinput

exec "$@"
