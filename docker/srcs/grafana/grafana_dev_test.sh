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
# Dashboad ブラウザチェック id:adm pass:adm
# http://localhost:3032/d/rYdddlPWk/node-exporter-full?orgId=1&refresh=1m
#=======================================================
source docker/srcs/.env
#=======================================================
echo -e "--------------------------------------------"
echo -e "sh docker/srcs/grafana/grafana_dev_test.sh"
echo -e "--------------------------------------------"
echo -e ""
echo -e "ダッシュボードとアラート設定のリロード ※あんまり役立たない気がする。リセットされてない様子なので make しなおすことがしばしば"
echo -e "[cmd]: curl -X POST -u "adm:adm" http://localhost:${GRAFANA_PORT}/api/admin/provisioning/dashboards/reload"
#=======================================================
# reload_grafana_provisioning:
	curl -X POST -u "adm:adm" http://localhost:${GRAFANA_PORT}/api/admin/provisioning/dashboards/reload
echo -e ""
echo -e "[cmd]: curl -X POST -u "adm:adm" http://localhost:${GRAFANA_PORT}/api/admin/provisioning/alerting/reload"
	curl -X POST -u "adm:adm" http://localhost:${GRAFANA_PORT}/api/admin/provisioning/alerting/reload
#=======================================================
# echo -e "\n"
# echo -e "stats表示"
# curl -H "Accept: application/json" -H "Content-Type: application/json" http://adm:adm@localhost:${GRAFANA_PORT}/api/admin/stats

