#!/bin/bash
# docker/srcs/uwsgi-django/django-entrypoint.sh

set -o errexit
set -o nounset
set -o pipefail


_wait_db_start_up() {
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
}


_migrate_db() {
#  python manage.py makemigrations
  python manage.py migrate --noinput
}


_add_user_to_db() {
  # register superuser
  python manage.py create_superuser

  # register init user
  python /code/trans_pj/add_test_user.py
}


_collect_staic_to_root() {
  # 全部の"static/"から、ルートのstatic/に集める
  python manage.py collectstatic --noinput
}

_main() {
  _wait_db_start_up

  _migrate_db
  _add_user_to_db
  _collect_staic_to_root
}


_main
exec "$@"
