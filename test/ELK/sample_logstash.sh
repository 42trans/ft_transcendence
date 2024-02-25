#!/bin/bash
# test/ELK/sample_logstash.sh

# 下記のコマンドでmacにjqをインストールしてください
# brew install jq 

# Logstashのホストとポート
LOGSTASH_HOST="localhost"
LOGSTASH_PORT=5044
ELASTIC_PASSWORD=changemeelastic

# Elasticsearchからサンプルデータを取得するクエリ
QUERY='{
  "query": { "match_all": {} },
  "size": 10
}'

# curl -k -XGET "https://elastic:${ELASTIC_PASSWORD}@localhost:9200/kibana_sample_data_flights/_search" -H 'Content-Type: application/json' -d"$QUERY" -o response.json

first_iteration=true

# Elasticsearchのサンプルデータインデックスからデータを取得
curl -k -XGET "https://elastic:${ELASTIC_PASSWORD}@localhost:9200/kibana_sample_data_flights/_search" -H 'Content-Type: application/json' -d"$QUERY" | \
jq -c '.hits.hits[]._source' | \
while read -r line; do
  # 初回のみ
  if $first_iteration; then
      echo "$line"
      first_iteration=false
  fi
  # Logstashへデータを送信
  echo "$line" | nc $LOGSTASH_HOST $LOGSTASH_PORT
done

echo "Data sent to Logstash. Check the Logstash output for results."
