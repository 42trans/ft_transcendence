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

_setting_cert_key() {
  # SSL証明書のパーミッション設定
  chown www-data:www-data /code/ssl/django.key
  chmod 600 /code/ssl/django.key

  chown www-data:www-data /code/ssl/django.crt
  chmod 644 /code/ssl/django.crt
}


_migrate_db() {
# DBスキーマの変更に基づきマイグレーションファイルを生成
# モデル変更時のみ実行
 python manage.py makemigrations

# マイグレーションファイルをDBに適用、DBを最新の状態で再構築
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
  _setting_cert_key

  _migrate_db

  _add_user_to_db
  _collect_static_to_root
}


_main

# uWSGIを実行
#uwsgi --ini /code/uwsgi.ini &

# Daphneを実行
#exec daphne -p 8003 trans_pj.asgi:application

exec "$@"
