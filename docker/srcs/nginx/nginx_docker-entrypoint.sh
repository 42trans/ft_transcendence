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
NOTIFY_FILE="/container_output/fin_nginx_entrypoint.txt"
if [ -f "$NOTIFY_FILE" ]; then
	echo "Removing existing $NOTIFY_FILE"
	rm -f "$NOTIFY_FILE"
fi
# -------------------------------------
# 環境変数を使用してnginxの設定ファイルを生成
envsubst < nginx.conf > /etc/nginx/nginx.conf
# -------------------------------------
# ホストでの確認のためにマウントvolumeにファイル出力
# -------------------------------------
echo "nginx_entrypoint.sh 終わり" > /container_output/fin_nginx_entrypoint.txt
exec "$@"
