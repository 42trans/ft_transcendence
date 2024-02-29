#!/bin/bash
# test/nginx/sample_nginx.sh
TEST_DIR="test/"
#=======================================================
# include
#=======================================================
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================
echo -e "cmd: docker ps | grep " nginx "\n"
docker ps | grep " nginx "
# ----------------
#  Prometheus
# ----------------
echo -e "\nPrometheus test: curl http://loclshost:9113/metrics"
FL=$(curl -s http://localhost:9113/metrics | head -1)
# 1行目が期待通りかどうか確認
if [[ "$FL" == "# HELP go_gc_duration_seconds A summary of the pause duration of garbage collection cycles." ]]; then  
    echo "${ESC}${GREEN}"
    echo "ok: $FL"
    echo "${ESC}${COLOR201}"
else
    echo "${ESC}${RED}"
    echo "ng: $FL"
    echo "${ESC}${COLOR201}"
fi