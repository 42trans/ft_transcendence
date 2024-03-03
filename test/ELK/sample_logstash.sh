#!/bin/bash
# test/ELK/sample_logstash.sh
#=======================================================
# 下記のコマンドでmacにjqをインストールしてください
# brew install jq 
#=======================================================
TEST_DIR="test/"
#=======================================================
# include
#=======================================================
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
# ---------------------------
# とりあえずpingで基礎的な接続をチェック
# ---------------------------
# docker exec uwsgi-django bash -c 'ping -c 4 logstash'
# docker exec logstash bash -c 'ping -c 4 elasticsearch'
# ---------------------------
# 接続チェック logstash to elasticsearch
# ---------------------------
# 環境変数の表示
# echo "LOGSTASH_PORT: $LOGSTASH_PORT"
# echo "$LOGSTASH_INTERNAL_PASSWORD"
# # ---------------------------
USER="logstash_internal"
LOGSTASH_INTERNAL_PASSWORD="changeme"
ELASTICSEARCH_URL="http://elasticsearch:9200"
# Elasticsearch クラスタのヘルス情報を取得
HEALTH=$(docker exec logstash bash -c "curl -u $USER:$LOGSTASH_INTERNAL_PASSWORD $ELASTICSEARCH_URL/_cluster/health?pretty")
# "status" フィールドを抽出
STATUS=$(echo "$HEALTH" | jq -r '.status')
# 接続と健康状態をチェック
if [[ "$STATUS" == "green" ]] || [[ "$STATUS" == "yellow" ]]; then
    echo "${ESC}${GREEN}"
	echo "ok: $STATUS"
    echo "${ESC}${COLOR180}"
else
    echo "${ESC}${RED}"
    echo "ng"
    echo "${ESC}${COLOR180}"
fi


# ---------------------------
# DjangoからLogstashへのログ送信テスト
# ※下記で標準出力にログを出して目視確認
# docker/srcs/elk/logstash/pipeline/logstash.conf
# ```
# output {
#   stdout { codec => rubydebug }
# ```
# ---------------------------
# LOGSTASH_HOST="logstash"
# LOGSTASH_PORT="50000"
# LOG_MESSAGE='{"message": "Test log from Django to Logstash", "tags": ["django.request"]}'
# docker exec uwsgi-django bash -c "echo '$LOG_MESSAGE' | nc -q0 $LOGSTASH_HOST $LOGSTASH_PORT"
