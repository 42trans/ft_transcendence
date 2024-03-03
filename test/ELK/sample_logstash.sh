#!/bin/bash
# # test/ELK/sample_logstash.sh
# #=======================================================
# # 下記のコマンドでmacにjqをインストールしてください
# # brew install jq 
# #=======================================================
# # include
# #=======================================================
# # TEST_DIR="test/"
# # if [ -z "$COLOR_SH" ]; then
# #   source "${TEST_DIR}color.sh"
# #   COLOR_SH=true
# # fi
# # souce docker/srcs/.env



# # Logstashのホストとポート
# LOGSTASH_HOST="localhost"
# # LOGSTASH_PORT=${LOGSTASH_PORT}
# ELASTIC_PASSWORD=changeme

# # # Elasticsearchからサンプルデータを取得するクエリ
# # QUERY='{
# #   "query": { "match_all": {} },
# #   "size": 10
# # }'

# # # curl -k -XGET "https://elastic:${ELASTIC_PASSWORD}@localhost:9200/kibana_sample_data_flights/_search" -H 'Content-Type: application/json' -d"$QUERY" -o response.json

# # first_iteration=true

# # # Elasticsearchのサンプルデータインデックスからデータを取得
# # curl -k -XGET "https://elasticsearch:${ELASTIC_PASSWORD}@localhost:${ELASTIC_SEARCH_PORT}/kibana_sample_data_flights/_search" -H 'Content-Type: application/json' -d"$QUERY" | \
# # jq -c '.hits.hits[]._source' | \
# # while read -r line; do
# #   # 初回のみ
# #   if $first_iteration; then
# #       echo "$line"
# #       first_iteration=false
# #   fi
# #   # Logstashへデータを送信
# #   echo "$line" | nc $LOGSTASH_HOST $LOGSTASH_PORT
# # done

# # echo "Data sent to Logstash. Check the Logstash output for results."

# # echo -e "log"
# # curl 'http://localhost:9200/_cat/count/access_log_nginx'



# ---------------------------
# DEBUG: logstash -> elasticserch
# ---------------------------
# echo "LOGSTASH_PORT: $LOGSTASH_PORT"
# echo "$LOGSTASH_INTERNAL_PASSWORD"
# # ---------------------------
USER="logstash_internal"
LOGSTASH_INTERNAL_PASSWORD="changeme"
ELASTICSEARCH_URL="http://elasticsearch:9200"
docker exec elk-logstash-1 bash -c "curl -u $USER:$LOGSTASH_INTERNAL_PASSWORD $ELASTICSEARCH_URL/_cluster/health?pretty"


# curl -X POST "http://localhost:5044" -H 'Content-Type: application/json' -d '{
#   "message": "This is a test message from nginx",
#   "type": "nginx",
#   "@timestamp": "2024-03-03T00:00:00.000Z"
# }'


# 接続チェック
# docker exec -it elk-logstash-1 bash
# ping elasticsearch
