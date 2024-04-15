#!/bin/bash
# docker/srcs/uwsgi-django/django-entrypoint.sh

set -o errexit
set -o nounset
set -o pipefail


_setting_log_file() {
  touch /code/django_debug.log && chown www-data:www-data /code/django_debug.log
  chown www-data:www-data /code/django_debug.log
  chmod 664 /code/django_debug.log
}


_migrate_db() {
  python manage.py makemigrations
  python manage.py migrate --noinput
}


_add_user_to_db() {
  # register superuser
  python manage.py create_superuser

  # register init user
  python /code/trans_pj/add_test_user.py
}


_collect_static_to_root() {
  # 全部の"static/"から、ルートのstatic/に集める
  python manage.py collectstatic --noinput
}

_main() {
  _setting_log_file

  _migrate_db

  _add_user_to_db
  _collect_static_to_root
}


_main
exec "$@"
