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

# --------------------------------------------
# each metrics
# --------------------------------------------
echo -e "\n nginx metrics test: curl http://loclshost:9113/metrics"
FL=$(curl -s http://localhost:9113/metrics | head -1)
# 1行目が期待通りかどうか確認
if [[ "$FL" == "# HELP go_gc_duration_seconds A summary of the pause duration of garbage collection cycles." ]]; then  
    echo "${ESC}${GREEN}"
    echo "ok: $FL"
    echo "${ESC}${COLOR183}"
else
    echo "${ESC}${RED}"
    echo "ng: $FL"
    echo "${ESC}${COLOR183}"
fi

echo -e "\n frontend metrics test: curl -k http://localhost:3030/metrics | head -1" 
FL=$(curl -ks http://localhost:3030/metrics | head -1)
# 1行目が期待通りかどうか確認
if [[ "$FL" == "# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds." ]]; then  
    echo "${ESC}${GREEN}"
    echo "ok: $FL"
    echo "${ESC}${COLOR183}"
else
    echo "${ESC}${RED}"
    echo "ng: $FL"
    echo "${ESC}${COLOR183}"
fi

echo -e "\n Django metrics: curl -k https://localhost/metrics | head -1" 
FL=$(curl -ks https://localhost/metrics | head -1)
# 1行目が期待通りかどうか確認
if [[ "$FL" == "# HELP python_gc_objects_collected_total Objects collected during gc" ]]; then  
    echo "${ESC}${GREEN}"
    echo "ok: $FL"
    echo "${ESC}${COLOR183}"
else
    echo "${ESC}${RED}"
    echo "ng: $FL"
    echo "${ESC}${COLOR183}"
fi

echo -e "\n docker container: cadvisor metrics: curl http://localhost:8080/metrics | head -1" 
FL=$(curl -s http://localhost:8080/metrics | head -1)
# 1行目が期待通りかどうか確認
if [[ "$FL" == "# HELP cadvisor_version_info A metric with a constant '1' value labeled by kernel version, OS version, docker version, cadvisor version & cadvisor revision." ]]; then  
    echo "${ESC}${GREEN}"
    echo "ok: $FL"
    echo "${ESC}${COLOR183}"
else
    echo "${ESC}${RED}"
    echo "ng: $FL"
    echo "${ESC}${COLOR183}"
fi

echo -e "\n host: node-exporter metrics: curl http://localhost:9100/metrics | head -1" 
FL=$(curl -s http://localhost:9100/metrics | head -1)
# 1行目が期待通りかどうか確認
if [[ "$FL" == "# HELP go_gc_duration_seconds A summary of the pause duration of garbage collection cycles." ]]; then  
    echo "${ESC}${GREEN}"
    echo "ok: $FL"
    echo "${ESC}${COLOR183}"
else
    echo "${ESC}${RED}"
    echo "ng: $FL"
    echo "${ESC}${COLOR183}"
fi

echo -e "\n ELK metrics: curl http://localhost:9114/metrics | head -1" 
FL=$(curl -s http://localhost:9114/metrics | head -1)
# 1行目が期待通りかどうか確認
if [[ "$FL" == "# HELP elasticsearch_clusterinfo_last_retrieval_failure_ts Timestamp of the last failed cluster info retrieval" ]]; then  
    echo "${ESC}${GREEN}"
    echo "ok: $FL"
    echo "${ESC}${COLOR183}"
else
    echo "${ESC}${RED}"
    echo "ng: $FL"
    echo "${ESC}${COLOR183}"
fi

# http://localhost:9114/metrics