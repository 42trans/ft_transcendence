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

# ---------------------------------------
# Elasticsearchへのクエリを実行
# ---------------------------------------
echo -e "elasticsearch: GET http://localhost:9200/*nginx*/_search"
response=$(docker exec elasticsearch curl -s -X GET "http://$USERNAME:$PASSWORD@localhost:9200/*nginx*/_search?pretty")
# 'hits.total.value' の値を取得
hits=$(echo $response | jq '.hits.total.value')
# 'hits' の数を判断
if [ "$hits" -ge 1 ]; then
    echo "${ESC}${GREEN}"
    echo "ok: hits: $hits"
    echo "${ESC}${COLOR198}"
else
    echo "${ESC}${RED}"
    echo "ng"
    echo "${ESC}${COLOR198}"
fi
# ------------------------------------
# kibana curl localhost
# ------------------------------------
# -o /dev/null: curlの出力を/dev/nullに
# -w "%{http_code}\n": HTTPレスポンスコードを出力　※それを変数に
# -k: 証明書skip
echo "kibana test GET http://localhost:${KIBANA_PORT}/api/status"
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k http://localhost:${KIBANA_PORT}/api/status -u $USERNAME:$PASSWORD)
if [ "$RESPONSE_CODE" = "200" ]; then
    echo "${ESC}${GREEN}"
    echo "ok: status 200"
    echo "${ESC}${COLOR198}"
else
    echo "${ESC}${RED}"
    echo "ng. Response code: $RESPONSE_CODE"
    echo "${ESC}${COLOR198}"
fi
# ------------------------------------
# index登録 nginx test 
# ------------------------------------
# Elasticsearchからインデックスリストを取得
echo -e "\nErasticSeachのインデックス登録 localhost:9200/_cat/indices?v "
OUTPUT=$(docker exec elasticsearch curl -s -X GET "http://$USERNAME:$PASSWORD@localhost:9200/_cat/indices?v")
if echo "$OUTPUT" | grep -q "nginx"; then
    echo "${ESC}${GREEN}"
    RES=$(echo "$OUTPUT" | grep "nginx")
    echo -e "ok: nginx index"
    echo $RES | awk '{print $3}'
    echo "${ESC}${COLOR198}"
else
    echo "${ESC}${RED}"
    echo "ng"
    echo "${ESC}${COLOR198}"
fi

OUTPUT=$(docker exec elasticsearch curl -s -X GET "http://$USERNAME:$PASSWORD@localhost:9200/_cat/indices?v")
# echo $OUTPUT
if echo "$OUTPUT" | grep -q "django"; then
    echo "${ESC}${GREEN}"
    RES=$(echo "$OUTPUT" | grep "django")
    echo -e "ok: django index"
    echo $RES | awk '{print $3}'
    echo "${ESC}${COLOR198}"
else
    echo "${ESC}${RED}"
    echo "ng"
    echo "${ESC}${COLOR198}"
fi

