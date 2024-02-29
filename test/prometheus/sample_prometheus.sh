#!/bin/bash
# test/prometheus/sample_prometheus.sh
TEST_DIR="test/"
#=======================================================
# include
#=======================================================
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi

PROMETHEUS_URL="http://localhost:${PROMETHEUS_PORT}"
NGINX_URL="http://localhost:${NGINX_PORT}"

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
# uri:http://localhost:9091/api/v1/query?query=up{job="nginx"}
# endoce: http://localhost:9091/api/v1/query?query=up%7Bjob%3D%22nginx%22%7D
# --------------------------------------------
URL="http://localhost:${PROMETHEUS_PORT}/api/v1/query?query="
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

# Django も同様のテスト有り
echo -e "\ncurl -k https://localhost/metrics | head -1" 
FL=$(curl -ks https://localhost/metrics | head -1)
# 1行目が期待通りかどうか確認
if [[ "$FL" == "# HELP python_gc_objects_collected_total Objects collected during gc" ]]; then  
    echo "${ESC}${GREEN}"
    echo "ok"
    echo "${ESC}${COLOR180}"
else
    echo "${ESC}${RED}"
    echo "ng: $FL"
    echo "${ESC}${COLOR180}"
fi
