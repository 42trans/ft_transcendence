#!/bin/bash
# docker/srcs/django/django_entrypoint.sh
# -----------------------------------------------
# DEBUG
# -----------------------------------------------
# echo "entrypoint.sh start"
echo $POSTGRES_PASSWORD
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
# /code ディレクトリの確認と作成
# -------------------------------------
if [ ! -d "/code" ]; then
	mkdir -p /code
	chown www-data:www-data /code
	find /code -type d -exec chmod 755 {} \;
	find /code -type f -exec chmod 644 {} \;
fi
# -------------------------------------
cp /manage.py /code/manage.py
python manage.py migrate
# 静的ファイルの収集
python manage.py collectstatic --no-input --clear
# -------------------------------------
# 起動
echo "django_entrypoint.sh 終わり" > /container_output/fin_django_entrypoint.txt
echo "exec django"
exec "$@"