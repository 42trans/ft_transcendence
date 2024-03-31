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
# 参考:【HTTP API | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/developers/http_api/>

#=======================================================
echo -e "目的: 環境変数は適正か？"
echo -e "------------------------------------------------------"
echo -e ".env: GRAFANA_PORT=${GRAFANA_PORT} "
echo -e "3032 ならOK"
my_func_cmp "$GRAFANA_PORT" "3032"
# echo -e "------------------------------------------------------"
# echo -e "stats(統計情報)を表示"
# curl -H "Accept: application/json" -H "Content-Type: application/json" http://adm:adm@localhost:${GRAFANA_PORT}/api/admin/stats

#=======================================================
echo "${ESC}${COLOR201}"
echo -e "------------------------------------------------------"
echo -e " 目的: サービスは起動しているか？"
echo -e " 内容: api/healthでバージョンを取得"
echo -e " [cmd]: curl https://localhost:${GRAFANA_PORT}/api/health"
echo -e "------------------------------------------------------"
#=======================================================
GET_OUTPUT=$(curl -k -s -S https://localhost:${GRAFANA_PORT}/api/health)
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
echo -e "10.4.0 ならOK"
my_func_cmp "$GET_VALUE" "10.4.0"


#=======================================================
echo "${ESC}${COLOR201}"
echo -e "------------------------------------------------------"
echo -e " 目的: レポートは機能しているか？"
echo -e " 内容: admアカウントで使用状況レポートのプレビューを取得"
echo -e " [cmd]: https://adm:adm@localhost:${GRAFANA_PORT}/api/admin/usage-report-preview"
#=======================================================
echo -e "------------------------------------------------------"
GET_OUTPUT=$(curl -k -s -S -H "Accept: application/json" -H "Content-Type: application/json" https://adm:adm@localhost:${GRAFANA_PORT}/api/admin/usage-report-preview)
# echo -e "$GET_OUTPUT"
# $GET_OUTPUT expected:
# {"version":"10_4_0","metrics":{"stats.active_admins.count":1,...
GET_VALUE=$(echo "$GET_OUTPUT" | jq -r '.version')
echo -e "jq -r '.version': $GET_VALUE"
echo -e "10_4_0 ならOK"
my_func_cmp "$GET_VALUE" "10_4_0"


#=======================================================
echo "${ESC}${COLOR201}"
echo -e "------------------------------------------------------"
echo -e " 目的: dashboardは設定されているか？"
echo -e " 内容: フォルダー/ダッシュボード検索一覧を取得"
echo -e " [cmd]: curl https://adm:adm@localhost:3032/api/search"
# 参考:【フォルダー/ダッシュボード検索 HTTP API | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/developers/http_api/folder_dashboard_search/>
#=======================================================
echo -e "------------------------------------------------------"
GET_OUTPUT=$(curl -k -s -S https://adm:adm@localhost:3032/api/search)
# echo -e "$GET_OUTPUT"
# $GET_OUTPUT expected:
# [{"id":1,"uid":"rYdddlPWk","title":"Node Exporter Full","uri":"db/node-exporter-full","url":"/d/rYdddlPWk/node-exporter-full","slug":"","type":"dash-db","":["linux"],"isStarred":false,"sortMeta":0}]
# 配列になっているので注意！
GET_VALUE=$(echo "$GET_OUTPUT" | jq -r '.[1].title')
echo -e "jq -r '.title': $GET_VALUE"
echo -e "Node Exporter Full ならOK"
my_func_cmp "$GET_VALUE" "Node Exporter Full"


#=======================================================
echo "${ESC}${COLOR201}"
echo -e "------------------------------------------------------"
echo -e " 目的: 通知ポリシーは設定されているか？"
echo -e " 内容: 通知ポリシーの一覧を取得"
echo -e " [cmd]: curl -X GET -k -s -S -u "adm:adm" https://localhost:${GRAFANA_PORT}/api/v1/provisioning/policies"
# 参考:【HTTP API を使用してアラート リソースを管理する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/alerting/set-up/provision-alerting-resources/http-api-provisioning/>
#=======================================================
echo -e "------------------------------------------------------"
GET_OUTPUT=$(curl -X GET -k -s -S -u "adm:adm" https://localhost:${GRAFANA_PORT}/api/v1/provisioning/policies)
echo -e "$GET_OUTPUT"
# $GET_OUTPUT expected:
# {"receiver":"hioikawa-Discord","group_by":["grafana_folder","alertname"],"routes":[{"receiver":"hioikawa-Slack","group_by":["grafana_folder","alertname"],"matchers":["priority=\"high\""],"group_wait":"30s","group_interval":"5m","repeat_interval":"4h"}],"provenance":"file"}
GET_VALUE=$(echo "$GET_OUTPUT" | jq -r '.receiver')
echo -e "jq -r '.receiver': $GET_VALUE"
echo -e "hioikawa-Discord ならOK"
my_func_cmp "$GET_VALUE" "hioikawa-Discord"

echo "${ESC}${COLOR201}"
GET_VALUE=$(echo "$GET_OUTPUT" | jq -r '.routes[0].receiver')
echo -e "jq -r '.routes[0].receiver': $GET_VALUE"
echo -e "hioikawa-Slack ならOK"
my_func_cmp "$GET_VALUE" "hioikawa-Slack"
#=======================================================
# echo -e "\n"
# echo -e "alert表示"
# curl -X GET -u "adm:adm" http://localhost:${GRAFANA_PORT}/api/v1/provisioning/alert-rules
#=======================================================
# echo -e "\n"
# echo -e "contact-points表示"
# curl -X GET -u "adm:adm" http://localhost:${GRAFANA_PORT}/api/v1/provisioning/contact-points
#=======================================================