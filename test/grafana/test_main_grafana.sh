#!/bin/bash
# test/grafana/sample_grafana.sh
#=======================================================
# include
#=======================================================
TEST_DIR="test/"
if [ -z "$COLOR_SH" ]; then
	source "${TEST_DIR}color.sh"
	COLOR_SH=true
fi
if [ -z "$FUNC_SH" ]; then
	source "${TEST_DIR}func.sh"
	FUNC_SH=true
fi
#=======================================================
source docker/srcs/.env
#=======================================================
# Dashboad ブラウザチェック id:adm pass:adm
# http://localhost:3032/d/rYdddlPWk/node-exporter-full?orgId=1&refresh=1m
#=======================================================
# 参考:【cURL の例 | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/developers/http_api/curl-examples/>
#=======================================================
echo -e ".env: GRAFANA_PORT=${GRAFANA_PORT} "
echo -e "------------------------------------------------------"
echo -e " 内容: api/healthでバージョンを取得"
echo -e " [cmd]: curl http://localhost:${GRAFANA_PORT}/api/health"
echo -e "------------------------------------------------------"
#=======================================================
GET_OUTPUT=$(curl -s -S http://localhost:${GRAFANA_PORT}/api/health)
# echo "$GET_OUTPUT"
# $GET_OUTPUT expected:
# {
#   "commit": "03f502a94d17f7dc4e6c34acdf8428aedd986e4c",
#   "database": "ok",
#   "version": "10.4.0"
# }
# echo -e "------------------------------------------------------"
# # 結果から version を抽出し、変数に格納。
GET_VALUE=$(echo "$GET_OUTPUT" | jq -r '.version')
echo "jq -r '.version': $GET_VALUE"
echo -e "10.4.0ならOK"
my_func_cmp "$GET_VALUE" "10.4.0"
#=======================================================
echo -e "------------------------------------------------------"
echo -e " 内容: /api/admin/でバージョンを取得"
echo -e " [cmd]:  http://adm:adm@localhost:${GRAFANA_PORT}/api/admin/usage-report-preview"
#=======================================================
echo -e "------------------------------------------------------"
GET_OUTPUT=$(curl -s -S -H "Accept: application/json" -H "Content-Type: application/json" http://adm:adm@localhost:${GRAFANA_PORT}/api/admin/usage-report-preview)
# echo -e "$GET_OUTPUT"
# $GET_OUTPUT expected:
# {"version":"10_4_0","metrics":{"stats.active_admins.count":1,...
GET_VALUE=$(echo "$GET_OUTPUT" | jq -r '.version')
echo -e "jq -r '.version': $GET_VALUE"
echo -e "10_4_0ならOK"
my_func_cmp "$GET_VALUE" "10_4_0"