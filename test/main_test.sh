#!/bin/bash
TEST_DIR="test/"
#=======================================================
# include
#=======================================================
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================

echo "${ESC}${BG_PINK}"
echo "start test"
echo "${ESC}[m"
echo "${ESC}${COLOR201}"
echo "========================================================="
echo "nginx test"
echo "========================================================="
bash ./test/nginx/sample_nginx.sh
echo "${ESC}${COLOR198}"
echo "========================================================="
echo "postgres test"
echo "========================================================="
bash ./test/postgres/sample.sh
echo "${ESC}${COLOR183}"
echo "========================================================="
echo "frontend: bootstrap test"
echo "========================================================="
bash ./test/frontend/bootstrap/sample_bootstrap.sh
echo "${ESC}${COLOR180}"
echo "========================================================="
echo "django test"
echo "========================================================="
bash ./test/django/sample_django.sh
echo "${ESC}${COLOR201}"
echo "========================================================="
echo "pgadmin test"
echo "========================================================="
bash ./test/pgadmin/sample.pgadmin.sh

echo "${ESC}${COLOR198}"
echo "========================================================="
echo "hardhat test"
echo "========================================================="
bash ./test/hardhat/sample_hardhat.sh

echo "${ESC}${COLOR183}"
echo "========================================================="
echo "monitor: Prometheus test"
bash ./test/prometheus/sample_prometheus.sh
echo "========================================================="
echo "${ESC}${COLOR201}"
echo "========================================================="
echo "monitor: grafana test"
echo "========================================================="
bash ./test/grafana/sample_grafana.sh

echo "${ESC}${COLOR198}"
echo "========================================================="
echo "ELK: es & kibana test"
echo "========================================================="
bash ./test/ELK/sample_es_kibana.sh
echo "${ESC}${COLOR180}"
echo "========================================================="
echo "ELK: logstash test"
echo "========================================================="
bash ./test/ELK/sample_logstash.sh

echo "${ESC}[m"
