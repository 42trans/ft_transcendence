#!/bin/bash
# test/nginx/sample_nginx.sh
#=======================================================
# include
#=======================================================
TEST_DIR="test/"
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================
echo -e 'cmd: docker ps | grep " nginx "\n'
docker ps | grep " nginx "
