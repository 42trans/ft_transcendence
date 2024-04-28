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
# API URL設定
API_URL="http://localhost:8002/ja/pong/api/tournament/data/"
# GETリクエストでトーナメントデータを取得
GET_OUTPUT=$(curl -X GET "$API_URL")
echo $GET_OUTPUT
