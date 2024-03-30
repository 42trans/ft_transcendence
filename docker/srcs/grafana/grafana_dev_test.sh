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
echo -e "\n"
echo -e "stats表示"
curl -H "Accept: application/json" -H "Content-Type: application/json" http://adm:adm@localhost:${GRAFANA_PORT}/api/admin/stats
# expected:
# {"orgs":1,"dashboards":1,"snapshots":0,"tags":1,"datasources":1,"playlists":0,"stars":0,"alerts":3,"users":1,"admins":1,"editors":0,"viewers":0,"activeUsers":1,"activeAdmins":1,"activeEditors":0,"activeViewers":0,"activeSessions":1,"dailyActiveUsers":1,"dailyActiveAdmins":0,"dailyActiveEditors":0,"dailyActiveViewers":0,"dailyActiveSessions":1,"monthlyActiveUsers":1,"activeDevices":0}