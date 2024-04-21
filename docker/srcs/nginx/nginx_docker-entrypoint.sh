#!/bin/sh
# srcs/nginx/nginx_docker-entrypoint.sh
# -------------------------------------
# debug
# -------------------------------------
# echo $SERVER_NAME
# -------------------------------------
# エラー時にスクリプトの実行を停止
set -e
# -------------------------------------
# ホストでの確認用ファイルが存在する場合、削除する
# -------------------------------------
# NOTIFY_FILE="/container_output/nginx_entrypoint_sh_finished.txt"
# if [ -f "$NOTIFY_FILE" ]; then
# 	echo "Removing existing $NOTIFY_FILE"
# 	rm -f "$NOTIFY_FILE"
# fi
# -------------------------------------
# 環境変数を使用してnginxの設定ファイルを生成
envsubst '${SERVER_NAME},${GRAFANA_PORT}' < nginx.conf > /etc/nginx/nginx.conf
cp /uwsgi_params /etc/nginx/uwsgi_parames
# -------------------------------------
# ホストでの確認のためにマウントvolumeにファイル出力
# -------------------------------------
# echo "$NOTIFY_FILE 処理完了" > /container_output/nginx_entrypoint_sh_finished.txt
exec "$@"
