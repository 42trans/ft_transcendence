#!/bin/bash
# docker/srcs/elasticsearch/elasticsearch-docker-entrypoint.sh
# -----------------------------------------------
# DEBUG
# -----------------------------------------------
# echo "elasticsearch-docker-entrypoint.sh start"
echo $ELASTIC_PASSWORD
# -----------------------------------------------
# エラー時にスクリプトの実行を停止
set -e
# -----------------------------------------------
# notify.txtファイルが存在する場合、削除する
# -----------------------------------------------
NOTIFY_FILE="/container_output/elasticsearch_entrypoint_sh_finished.txt"
if [ -f "$NOTIFY_FILE" ]; then
	echo "Removing existing $NOTIFY_FILE"
	rm -f "$NOTIFY_FILE"
fi
# -----------------------------------------------
# start db background
# -----------------------------------------------
# Elasticsearchをバックグラウンドで起動
# `pid.txt` にプロセスID保存
PID_FILE="pid.txt"
/usr/share/elasticsearch/bin/elasticsearch -d -p ${PID_FILE}
# -----------------------------------------------
# サーバーが起動するまで指定回数だけ ping 試行
# -----------------------------------------------
HOST="localhost"
PORT="9200"
max=30
num=1
while (( num < max )); do
	if curl -s -k "https://${HOST}:${PORT}/" > /dev/null; then
		break
	fi
	echo "num = ${num}"
	sleep 1
	((num++))
done
if (( num == max )); then
	echo "connect Failed ${HOST}:${PORT}"
	exit 1
fi
# -----------------------------------------------
#  Elasticsearch が初めて実行される場合
# -----------------------------------------------
# 初回の起動フラグ
if [ ! -d "/usr/share/elasticsearch/data" ]; then
	cp /usr/share/elasticsearch/config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml.orig
	# setup.sh
	echo "bash setup.sh"
	bash /tmp/setup.sh
fi
# -----------------------------------------------
# start foreground
# -----------------------------------------------
if [ -f "${PID_FILE}" ]; then
	PID=$(cat ${PID_FILE})
	kill "${PID}"
	for i in {1..10}; do
		# kill -0 PID: 指定したPIDのプロセスが存在するか
		if ! kill -0 ${PID} > /dev/null 2>&1; then
			break
		fi
		echo "まだ実行中: Elasticsearch ${PID}"
		sleep 1
	done
	# 10秒後もプロセスが存在する場合、強制終了
	if kill -0 ${PID} > /dev/null 2>&1; then
		echo "強制終了"
		kill -9 ${PID}
	fi
	rm -f "${PID_FILE}"
fi
# Elasticsearchをフォアグラウンドで起動
echo "exec Elasticsearch"
echo "es_entrypoint.sh 終わり" > /container_output/elasticsearch_entrypoint_sh_finished.txt
exec /usr/share/elasticsearch/bin/elasticsearch