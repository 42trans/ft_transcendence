#!/bin/bash
# test/prometheus/sample_prometheus.sh


PROMETHEUS_URL="http://localhost:9090"
NGINX_URL="http://localhost:8085"

health_check=$(curl -s "${PROMETHEUS_URL}/-/healthy")
if [ "$health_check" = "Prometheus Server is Healthy." ]; then
    echo "ok: Healthy"
else
    echo "ng: Not healthy"
fi
# echo "--------------------------------------------"
# echo "DEBUG curl  
# echo "--------------------------------------------"
# curl  ${NGINX_URL}/stub_status
# curl "${PROMETHEUS_URL}"

# --------------------------------------------
# Nginxがアップしているか（up=1）
# PrometheusのAPIを使用してクエリを実行
# --------------------------------------------
# uri:http://localhost:9090/api/v1/query?query=up{job="nginx"}
# endoce: http://localhost:9090/api/v1/query?query=up%7Bjob%3D%22nginx%22%7D
# --------------------------------------------
URL="http://localhost:9090/api/v1/query?query="
QUERY='up{job="nginx"}'
E_QUERY=$(echo $QUERY | jq -Rr @uri) 
E_URL=$URL$E_QUERY
response=$(curl -s "$E_URL")
echo $response
# # 応答からメトリクスの値を抽出（jqコマンドを使用）
value=$(echo $response | jq -r '.data.result[0].value[1]')
# メトリクスの値に基づいて結果を表示
if [ "$value" == "1" ]; then
    echo "ok: nginx up=1"
else
    echo "ng:"
fi