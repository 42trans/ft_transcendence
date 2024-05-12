#!/bin/bash
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
# python test
# make test_tournament_django
#=======================================================
# TestTourCreate
docker exec -it uwsgi-django bash -c "python manage.py test pong.tournament.tests.test_tour_create.TestTourCreate"
#=======================================================
# sh test
#=======================================================
# API URL設定
API_URL="http://localhost:8002/ja/pong/api/tournament/data/"
# GETリクエストでトーナメントデータを取得
GET_OUTPUT=$(curl -X GET "$API_URL")
echo $GET_OUTPUT
