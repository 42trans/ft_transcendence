#!/bin/bash
# test/django/sample_django.sh
#=======================================================
# include
#=======================================================
TEST_DIR="test/"
if [ -z "$COLOR_SH" ]; then
source "${TEST_DIR}color.sh"
COLOR_SH=true
fi
#=======================================================
# インストールが必要です
# brew install postgresql
#=======================================================
# # uwsgi-django コンテナに入る
# docker exec -it uwsgi-django bash 
# リッスンしているポートを確認
# netstat -tuln  
#=======================================================
	# ports:
	#   - "8086:8000" # socket
	#   - "8096:8001" # http
#=======================================================
	# docker exec nginx ping uwsgi-django
	# curl -k https://localhost/
	# uwsgi --connect-and-read localhost:8086
	# docker exec nginx bash -c "curl -H "Host:localhost" http://uwsgi-django:8000/"
	# docker exec nginx bash -c uwsgi --connect-and-read uwsgi-django:8000
#=======================================================

echo -e "cmd: docker ps | grep "uwsgi-django"\n"
docker ps | grep "uwsgi-django"

# -o /dev/null: curlの出力を/dev/nullに
# -w "%{http_code}\n": HTTPレスポンスコードを出力　※それを変数に
# -k: 証明書skip
echo -e "\ntest SSL nginx to uWSGI: GET https://localhost"
RESPONSE_CODE=0
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k https://localhost)
if [ "$RESPONSE_CODE" = "200" ]; then
	echo "${ESC}${GREEN}"
	echo -e "ok: 200"
	echo "${ESC}${COLOR180}"
else
	echo "ng. Response code: $RESPONSE_CODE"
fi

echo -e "\\ntest SSL nginx to uWSGI: GET https://hioikawa.42.fr"
RESPONSE_CODE=0
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k https://hioikawa.42.fr)
if [ "$RESPONSE_CODE" = "200" ]; then
	echo "${ESC}${GREEN}"
	echo "ok: 200: $(curl -s -k https://hioikawa.42.fr | head -1)"
	echo "${ESC}${COLOR180}"
else
	echo "ng. Response code: $RESPONSE_CODE"
fi

echo -e "\ntest Host to http: GET http://localhost:8096/"
RESPONSE_CODE=0
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k http://localhost:8096/)
if [ "$RESPONSE_CODE" = "200" ]; then
	echo "${ESC}${GREEN}"
	echo -e "ok: 200"
	echo "${ESC}${COLOR180}"
else
	echo "${ESC}${RED}"
	echo "ng. Response code: $RESPONSE_CODE"
	echo "${ESC}${COLOR180}"
fi

echo -e "\ntest Host to http: GET http://localhost:8096/api/status/"
RESPONSE_CODE=0
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k http://localhost:8096/api/status/)
if [ "$RESPONSE_CODE" = "200" ]; then
	echo "${ESC}${GREEN}"
	echo -e "ok: 200"
	echo "${ESC}${COLOR180}"
else
	echo "${ESC}${RED}"
	echo "ng. Response code: $RESPONSE_CODE"
	echo "${ESC}${COLOR180}"
fi

echo -e "\ntest Docker to http: GET http://uwsgi-django:8001/"
RESPONSE_CODE=0
RESPONSE_CODE=$(docker exec -it nginx bash -c "curl -o /dev/null -s -w %{http_code} -k -H "Host:localhost" http://uwsgi-django:8001/")
if [ "$RESPONSE_CODE" = "200" ]; then
	echo "${ESC}${GREEN}"
	echo -e "ok: 200"
	echo "${ESC}${COLOR180}"
else
	echo "${ESC}${RED}"
	echo "ng. Response code: $RESPONSE_CODE"
	echo "${ESC}${COLOR180}"
fi


echo -e "\ntest Docker to http: GET http://uwsgi-django:8001/api/status/"
RESPONSE_CODE=0
RESPONSE_CODE=$(docker exec -it nginx bash -c "curl -o /dev/null -s -w %{http_code} -k -H "Host:localhost" http://uwsgi-django:8001/api/status/")
# ----------------
# -v で出力　※RESPONSE_CODEの値に余計な出力が入るので 200 でもOKは出力されない
# RESPONSE_CODE=$(docker exec -it nginx bash -c "curl -v -o /dev/null -s -w %{http_code} -k -H "Host:localhost" http://uwsgi-django:8001/api/status/")
# echo "res  $RESPONSE_CODE"
# ----------------
if [ "$RESPONSE_CODE" = "200" ]; then
	echo "${ESC}${GREEN}"
	echo -e "ok: 200"
	echo "${ESC}${COLOR180}"
else
	echo "${ESC}${RED}"
	echo "ng. Response code: $RESPONSE_CODE"
	echo "${ESC}${COLOR180}"
fi


# ----------------
#  metrics for prometheus
# ----------------
# docker exec uwsgi-django sh -c 'curl http://localhost:8000/metrics'
# ----------------
echo -e "test metrics: curl -k https://localhost/metrics | head -1" 
FL=$(curl -ks https://localhost/metrics | head -1)
# 1行目が期待通りかどうか確認
if [[ "$FL" == "# HELP python_gc_objects_collected_total Objects collected during gc" ]]; then  
	echo "${ESC}${GREEN}"
	echo "ok: $FL"
	echo "${ESC}${COLOR180}"
else
	echo "${ESC}${RED}"
	echo "ng: $FL"
	echo "${ESC}${COLOR180}"
fi

# ----------------
#  db 
# ----------------
echo -e "DB test: test/django/sample_db.sh" 
sh test/django/sample_db.sh docker/srcs/.env
# sh test/django/add_10user.sh docker/srcs/.env

# ---------------
# api経由でDBに追加
# ---------------
echo -e "api経由でDBに追加"
echo -e "sh test/django/game_result_json.sh" 
GET_OUTPUT=$(sh test/django/game_result_json.sh)
# sh test/django/game_result_json.sh
POSTGET_OUTPUT_STATUS=$(echo "$GET_OUTPUT" | jq -r '.status')

if [ "$POSTGET_OUTPUT_STATUS" == "success" ]; then
	echo -e "\033[1;32m OK \033[0m"
	echo "${ESC}${COLOR180}"
else
	echo -e "\033[1;31mNG\033[0m"
	echo "${ESC}${COLOR180}"
fi

# ---------------
# api経由でDBから取得
# ---------------
echo -e "api経由でDBから取得: <h1>pongゲーム結果</h1>が取得できたらOK"
GET_OUTPUT=$(sh test/django/fetch_db.sh)
echo -e "sh test/django/fetch_db.sh" 

if [ "$GET_OUTPUT" == "<h1>pongゲーム結果</h1>" ]; then
	echo -e "\033[1;32m OK \033[0m"
else
	echo -e "\033[1;31mNG\033[0m"
fi
