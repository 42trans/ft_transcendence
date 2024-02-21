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
# -------------------------------------
python /code/manage.py migrate
# 静的ファイルの収集
python /code/manage.py collectstatic --no-input --clear
# -------------------------------------
# 起動
echo "django_entrypoint.sh 終わり" > /container_output/fin_django_entrypoint.txt
echo "Running command: $@"
exec "$@"