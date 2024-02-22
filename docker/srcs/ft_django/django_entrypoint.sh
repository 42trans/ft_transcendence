#!/bin/bash
# docker/srcs/django/django_entrypoint.sh
# -----------------------------------------------
# DEBUG
# -----------------------------------------------
# echo "entrypoint.sh start"
# echo $POSTGRES_PASSWORD
# -----------------------------------------------
# エラー時にスクリプトの実行を停止
set -e
# -------------------------------------
# notify.txtファイルが存在する場合、削除する
# -------------------------------------
NOTIFY_FILE="/container_output/fin_django_entrypoint.txt"
if [ -f "$NOTIFY_FILE" ]; then
	echo "Removing existing $NOTIFY_FILE"
	rm -f "$NOTIFY_FILE"
fi
# -------------------------------------
# 初回のみ: マウントボリュームにファイルが存在しない場合
# -------------------------------------
if [ -z "$(ls -A /code)" ]; then
	mkdir -p /code
	chown www-data:www-data /code
	cp -r /ft_django/. /code/
	find /code -type d -exec chmod 755 {} \;
	find /code -type f -exec chmod 644 {} \;
fi
if [ ! -f "/etc/uwsgi/uwsgi.ini" ]; then
	cp /uwsgi.ini /etc/uwsgi/
fi
if [ -z "$(ls -A /static)" ]; then
	mkdir -p /static
	chown www-data:www-data /static
	cp -r /tmp_static/. /static/
	find /static -type d -exec chmod 755 {} \;
	find /static -type f -exec chmod 644 {} \;
fi
# -------------------------------------
count=0
max_retries=90
HOST="postgres"
DB_PORT=5432 
while [ $count -lt $max_retries ]; do
if pg_isready ping -h"$HOST" -P"$DB_PORT" --quiet; then
	echo "PostgreSQL ok"
	break
fi
echo "waiting"
count=$((count+1))
sleep 5
#   sleep 30
done
if [ $count -eq $max_retries ]; then
	echo "failed"
	exit 1
fi
# -------------------------------------
python /code/manage.py migrate
# 静的ファイルの収集
python /code/manage.py collectstatic --no-input --clear
# -------------------------------------
# 起動
echo "django_entrypoint.sh 終わり" > /container_output/fin_django_entrypoint.txt
echo "Running command: $@"
exec "$@"