#!/bin/bash
# docker/srcs/elasticsearch/elasticsearch-docker-entrypoint.sh
# -----------------------------------------------
# DEBUG
# -----------------------------------------------
echo "elasticsearch-docker-entrypoint.sh start"
echo $ELASTIC_PASSWORD
# -----------------------------------------------
# エラー時にスクリプトの実行を停止
set -e
CERTS_DIR="/usr/share/elasticsearch/config/certs"
# -----------------------------------------------
# notify.txtファイルが存在する場合、削除する
# -----------------------------------------------
NOTIFY_FILE="/container_output/elasticsearch_entrypoint_sh_finished.txt"
if [ -f "$NOTIFY_FILE" ]; then
	echo "Removing existing $NOTIFY_FILE"
	rm -f "$NOTIFY_FILE"
fi
# -----------------------------------------------
# 証明書がない場合作成する
# -----------------------------------------------
if [ ! -f "/usr/share/elasticsearch/config/certs/ca/ca.crt" ]; then
	echo "bash setup.sh"
	bash /tmp/setup.sh
fi
# -----------------------------------------------
# start db background
# -----------------------------------------------
# `pid.txt` にプロセスID保存
PID_FILE="pid.txt"
# Elasticsearchをバックグラウンドで起動
/usr/share/elasticsearch/bin/elasticsearch -d -p ${PID_FILE}
# -----------------------------------------------
# サーバーが起動するまで指定回数だけ curl 試行
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
	echo "/data not found"
	cp /usr/share/elasticsearch/config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml.orig
fi

# Elasticsearch の準備ができるまで待機
echo "Waiting for Elasticsearch availability"
until curl -s --cacert "${CERTS_DIR}/ca/ca.crt" "https://${HOST}:${PORT}" | grep -q "missing authentication credentials"; do
# until curl -s --cacert "${CERTS_DIR}/ca/ca.crt" "https://elasticsearch:9200" | grep -q "missing authentication credentials"; do
  sleep 30
done

# # 初期パスワード設定 (ここで elastic ユーザーのパスワードを設定)
# echo "Setting initial passwords..."
# curl -s -X POST --cacert "${CERTS_DIR}/ca/ca.crt" -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" "https://elasticsearch:9200/_security/user/elastic/_password" -d "{ \"password\": \"${ELASTIC_PASSWORD}\" }"


echo "Checking Elasticsearch cluster health..."
curl -k -u "elastic:${ELASTIC_PASSWORD}" "https://${HOST}:${PORT}/_cluster/health" | tee health_response.json

echo "Attempting to authenticate with elastic user..."
curl -k -u "elastic:${ELASTIC_PASSWORD}" "https://${HOST}:${PORT}/" | tee auth_response.json

echo "Retrieving current kibana_system user information..."
curl -k -u "elastic:${ELASTIC_PASSWORD}" "https://${HOST}:${PORT}/_security/user/kibana_system" | tee kibana_user_before.json

echo "Setting kibana_system password..."
PASSWORD_SET_RESPONSE=$(curl -s -k -X POST -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" "https://${HOST}:${PORT}/_security/user/kibana_system/_password" -d "{\"password\":\"${KIBANA_PASSWORD}\"}")
echo "Password set response: $PASSWORD_SET_RESPONSE"

if echo "$PASSWORD_SET_RESPONSE" | grep -q "^{}$"; then
  echo "kibana_system password set successfully."
else
  echo "Failed to set kibana_system password."
fi

echo "Retrieving updated kibana_system user information..."
curl -k -u "elastic:${ELASTIC_PASSWORD}" "https://${HOST}:${PORT}/_security/user/kibana_system" | tee kibana_user_after.json


# # Kibana のパスワード設定
# echo "Setting kibana_system password"
# echo "ELASTIC_PASSWORD ${ELASTIC_PASSWORD}"
# echo "KIBANA_PASSWORD ${KIBANA_PASSWORD}"
# echo "${CERTS_DIR}/ca/ca.crt"
# # DEBUG
# curl -k -u "elastic:${ELASTIC_PASSWORD}" "https://${HOST}:${PORT}/_cluster/health"
# curl -k -u "elastic:${ELASTIC_PASSWORD}" "https://${HOST}:${PORT}/"

until curl -s -X POST --cacert "${CERTS_DIR}/ca/ca.crt" -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" "https://${HOST}:${PORT}/_security/user/kibana_system/_password" -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do
# until curl -s -X POST --cacert "${CERTS_DIR}/ca/ca.crt" -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" "https://elasticsearch:9200/_security/user/kibana_system/_password" -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do
  sleep 10
done
echo " password done!"


# curl -k -u "elastic:changeme" "https://localhost:9200/_cluster/health"
# curl -k -u "elastic:pw_kibana_1234567890" "https://localhost:9200/_cluster/health"

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