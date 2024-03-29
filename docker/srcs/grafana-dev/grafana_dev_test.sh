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

echo ""

curl -H "Accept: application/json" -H "Content-Type: application/json" http://adm:adm@localhost:3032/api/admin/stats
# expected:
# {"orgs":2,"dashboards":1,"snapshots":0,"tags":1,"datasources":1,"playlists":0,"stars":0,"alerts":0,"users":1,"admins":2,"editors":0,"viewers":0,"activeUsers":1,"activeAdmins":1,"activeEditors":0,"activeViewers":0,"activeSessions":1,"dailyActiveUsers":1,"dailyActiveAdmins":0,"dailyActiveEditors":0,"dailyActiveViewers":0,"dailyActiveSessions":1,"monthlyActiveUsers":1,"activeDevices":0}