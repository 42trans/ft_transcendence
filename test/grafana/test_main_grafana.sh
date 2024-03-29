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


#=======================================================
echo "${ESC}${COLOR201}"
echo -e "------------------------------------------------------"
echo -e " 目的: サービスは起動しているか？"
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
echo -e "10.4.0 ならOK"
my_func_cmp "$GET_VALUE" "10.4.0"


#=======================================================
echo "${ESC}${COLOR201}"
echo -e "------------------------------------------------------"
echo -e " 目的: レポートは機能しているか？"
echo -e " 内容: admアカウントで使用状況レポートのプレビューを取得"
echo -e " [cmd]: http://adm:adm@localhost:${GRAFANA_PORT}/api/admin/usage-report-preview"
#=======================================================
echo -e "------------------------------------------------------"
GET_OUTPUT=$(curl -s -S -H "Accept: application/json" -H "Content-Type: application/json" http://adm:adm@localhost:${GRAFANA_PORT}/api/admin/usage-report-preview)
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
echo -e " 目的: プロビジョニングは設定されているか？"
echo -e " 内容: フォルダー/ダッシュボード検索一覧を取得"
echo -e " [cmd]: curl http://adm:adm@localhost:3032/api/search"
# 参考:【フォルダー/ダッシュボード検索 HTTP API | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/developers/http_api/folder_dashboard_search/>
#=======================================================
echo -e "------------------------------------------------------"
GET_OUTPUT=$(curl -s -S http://adm:adm@localhost:3032/api/search)
echo -e "$GET_OUTPUT"
# $GET_OUTPUT expected:
# [{"id":1,"uid":"rYdddlPWk","title":"Node Exporter Full","uri":"db/node-exporter-full","url":"/d/rYdddlPWk/node-exporter-full","slug":"","type":"dash-db","":["linux"],"isStarred":false,"sortMeta":0}]
# 配列になっているので注意！
# GET_VALUE=$(echo "$GET_OUTPUT" | jq -r '.[0].title')
# echo -e "jq -r '.title': $GET_VALUE"
# echo -e "Node Exporter Full ならOK"
# my_func_cmp "$GET_VALUE" "Node Exporter Full"