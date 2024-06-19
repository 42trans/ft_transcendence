#!/bin/bash
#=======================================================
# include
#=======================================================
TEST_DIR="test/"
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================
echo "${ESC}${BG_PINK}"
echo "start test"
echo "${ESC}[m"
#=======================================================

#=======================================================
# Web
#=======================================================
echo "${ESC}${COLOR201}"
echo "========================================================="
echo "postgres test"
echo "========================================================="
bash ./test/postgres/sample.sh
echo "${ESC}${COLOR201}"
echo "========================================================="
echo "nginx test"
echo "========================================================="
bash ./test/nginx/sample_nginx.sh
echo "${ESC}${COLOR183}"
#=======================================================
echo "========================================================="
echo "frontend: bootstrap test"
echo "========================================================="
bash ./test/frontend/bootstrap/sample_bootstrap.sh
echo "${ESC}${COLOR180}"
echo "========================================================="
echo "django test"
echo "========================================================="
bash ./test/django/sample_django.sh
#=======================================================
echo "${ESC}${COLOR198}"
echo "========================================================="
echo "hardhat test"
echo "========================================================="
bash ./test/hardhat/test_main_hardhat.sh
echo "${ESC}${COLOR201}"
echo "========================================================="
echo "ganache test"
echo "========================================================="
bash ./test/ganache/test_main_ganache.sh


#=======================================================
# monitor
#=======================================================
echo "${ESC}${COLOR183}"
echo "========================================================="
echo "monitor: Prometheus test"
echo "========================================================="
bash ./test/prometheus/sample_prometheus.sh

echo "${ESC}${COLOR201}"
echo "========================================================="
echo "monitor: grafana test"
echo "========================================================="
bash ./test/grafana/test_main_grafana.sh

# #=======================================================
# # ELK 
# #=======================================================
# echo "${ESC}${COLOR183}"
# echo "========================================================="
# echo "filebeat test"
# echo "========================================================="
# bash ./test/filebeat/filebeat_main.sh
# echo "${ESC}${COLOR198}"
# echo "========================================================="
# echo "ELK: elasticsearch & kibana test"
# echo "========================================================="
# bash ./test/ELK/sample_es_kibana.sh
# echo "${ESC}${COLOR180}"
# echo "========================================================="
# echo "ELK: logstash test"
# echo "========================================================="
# bash ./test/ELK/logstash_main.sh

echo "${ESC}[m"