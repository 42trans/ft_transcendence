#!/bin/bash
TEST_DIR="test/"
#=======================================================
# include
#=======================================================
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
# -------------------------
# filebeat to logstash
# -------------------------
if docker exec filebeat nc -vz logstash 5044; then
    echo "${ESC}${GREEN}"
    echo "ok $FL"
    echo "${ESC}${COLOR198}"
else
    echo "${ESC}${RED}"
    echo "ng"
    echo "${ESC}${COLOR198}"
fi