#!/bin/bash
# test/frontend/bootstrap/sample_bootstrap.sh
TEST_DIR="test/"
#=======================================================
# include
#=======================================================
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================

# -o /dev/null: curlの出力を/dev/nullに
# -w "%{http_code}\n": HTTPレスポンスコードを出力　※それを変数に
# -k: 証明書skip
echo "test GET http://localhost:${FRONTEND_PORT}"
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k http://localhost:${FRONTEND_PORT})
if [ "$RESPONSE_CODE" = "200" ]; then
    echo "${ESC}${GREEN}"
    echo -e "ok: 200"
    echo "${ESC}${COLOR183}"
else
    echo "${ESC}${RED}"
    echo "ng. Response code: $RESPONSE_CODE"
    echo "${ESC}${COLOR180}"
fi

echo "test GET http://localhost:${FRONTEND_PORT}/three.html"
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k http://localhost:${FRONTEND_PORT}/three.html)
if [ "$RESPONSE_CODE" = "200" ]; then
    echo "${ESC}${GREEN}"
    echo -e "ok: 200"
    echo "${ESC}${COLOR183}"
else
    echo "${ESC}${RED}"
    echo "ng. Response code: $RESPONSE_CODE"
    echo "${ESC}${COLOR180}"
fi


# ----------------
#  Prometheus
# ----------------
# docker exec uwsgi-django sh -c 'curl http://localhost:8000/metrics'
# ----------------
echo -e "curl -k http://localhost:3030/metrics | head -1" 
FL=$(curl -ks http://localhost:3030/metrics | head -1)
# 1行目が期待通りかどうか確認
if [[ "$FL" == "# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds." ]]; then  
    echo "${ESC}${GREEN}"
    echo "ok: $FL"
    echo "${ESC}${COLOR180}"
else
    echo "${ESC}${RED}"
    echo "ng: $FL"
    echo "${ESC}${COLOR180}"
fi