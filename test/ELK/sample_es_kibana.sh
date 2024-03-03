#!/bin/bash
TEST_DIR="test/"
#=======================================================
# include
#=======================================================
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi

USERNAME="elastic"
PASSWORD="changeme"
# ------------------------------------
# curl localhost
# ------------------------------------
# -o /dev/null: curlの出力を/dev/nullに
# -w "%{http_code}\n": HTTPレスポンスコードを出力　※それを変数に
# -k: 証明書skip
echo "kibana test GET http://localhost:${KIBANA_PORT}/api/status"
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k http://localhost:${KIBANA_PORT}/api/status -u $USERNAME:$PASSWORD)
if [ "$RESPONSE_CODE" = "200" ]; then
    echo "${ESC}${GREEN}"
    echo "200 ok"
    echo "${ESC}${COLOR198}"
else
    echo "${ESC}${RED}"
    echo "ng. Response code: $RESPONSE_CODE"
    echo "${ESC}${COLOR198}"
fi
# ------------------------------------
# filebeat connect test 
# ------------------------------------
# Elasticsearchからインデックスリストを取得
echo -e "\nErasticSeachのインデックスリスト localhost:9200/_cat/indices?v "
OUTPUT=$(docker exec elk-elasticsearch-1 curl -X GET "http://$USERNAME:$PASSWORD@localhost:9200/_cat/indices?v")
echo "$OUTPUT"
# "filebeat-"があるならOK
# if echo "$OUTPUT" | grep -q "filebeat-"; then
#     echo "${ESC}${GREEN}"
#     RES=$(echo "$OUTPUT" | grep "filebeat-")
#     echo "ok: $RES"
#     echo "${ESC}${COLOR198}"
# else
#     echo "${ESC}${RED}"
#     echo "ng: $OUTPUT"
#     echo "${ESC}${COLOR198}"
# fi
# "filebeat-"があるならOK
if echo "$OUTPUT" | grep -q "nginx"; then
    echo "${ESC}${GREEN}"
    RES=$(echo "$OUTPUT" | grep "nginx")
    echo "ok"
    echo "${ESC}${COLOR198}"
else
    echo "${ESC}${RED}"
    echo "ng"
    echo "${ESC}${COLOR198}"
fi