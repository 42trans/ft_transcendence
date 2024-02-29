#!/bin/bash
# test/django/sample_django.sh
TEST_DIR="test/"
#=======================================================
# include
#=======================================================
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================
# # uwsgi_django コンテナに入る
# docker exec -it uwsgi_django bash 
# リッスンしているポートを確認
# netstat -tuln  
#=======================================================
    # ports:
    #   - "8086:8000" # socket
    #   - "8096:8001" # http
#=======================================================
    # docker exec nginx ping uwsgi_django
    # curl -k https://localhost/
    # uwsgi --connect-and-read localhost:8086
    # docker exec nginx bash -c "curl -H "Host:localhost" http://uwsgi_django:8000/"
    # docker exec nginx bash -c uwsgi --connect-and-read uwsgi_django:8000
#=======================================================

echo -e "cmd: docker ps | grep "uwsgi_django"\n"
docker ps | grep "uwsgi_django"

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
    echo -e "ok: 200"
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

echo -e "\ntest Docker to http: GET http://uwsgi_django:8001/"
RESPONSE_CODE=0
RESPONSE_CODE=$(docker exec -it nginx bash -c "curl -o /dev/null -s -w %{http_code} -k -H "Host:localhost" http://uwsgi_django:8001/")
if [ "$RESPONSE_CODE" = "200" ]; then
    echo "${ESC}${GREEN}"
    echo -e "ok: 200"
    echo "${ESC}${COLOR180}"
else
    echo "${ESC}${RED}"
    echo "ng. Response code: $RESPONSE_CODE"
    echo "${ESC}${COLOR180}"
fi


echo -e "\ntest Docker to http: GET http://uwsgi_django:8001/api/status/"
RESPONSE_CODE=0
RESPONSE_CODE=$(docker exec -it nginx bash -c "curl -o /dev/null -s -w %{http_code} -k -H "Host:localhost" http://uwsgi_django:8001/api/status/")
# ----------------
#  DEBUG
# ----------------
# -v で出力　※RESPONSE_CODEの値に余計な出力が入るので 200 でもOKは出力されない
# RESPONSE_CODE=$(docker exec -it nginx bash -c "curl -v -o /dev/null -s -w %{http_code} -k -H "Host:localhost" http://uwsgi_django:8001/api/status/")
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

