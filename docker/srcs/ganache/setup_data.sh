#!/bin/bash
# docker/srcs/ganache/setup_data.sh
# =============================================
# for文でPongゲームの結果をAPIに送信するスクリプト
# =============================================
API_URL="https://hioikawa.42.fr/pong/api/save_testnet/"
# match_idを1から20まで連番で処理
for MATCH_ID in {1..20}; do
	# player nameの末尾に1~100のランダムな数字を追加
	PLAYER_1_NAME="キュア$((RANDOM % 100 + 1))"
	PLAYER_2_NAME="キュア$((RANDOM % 100 + 1))"

	# どちらかのスコアをランダムに15、もう片方を14以下に設定
	if [ $((RANDOM % 2)) -eq 0 ]; then
		PLAYER_1_SCORE=15
		PLAYER_2_SCORE=$((RANDOM % 15)) # 0から14までのランダム値
	else
		PLAYER_1_SCORE=$((RANDOM % 15)) # 0から14までのランダム値
		PLAYER_2_SCORE=15
	fi

	# JSONデータの準備
	JSON_DATA="{
		\"match_id\": $MATCH_ID,
		\"player_1_score\": $PLAYER_1_SCORE,
		\"player_2_score\": $PLAYER_2_SCORE,
		\"player_1_name\": \"$PLAYER_1_NAME\",
		\"player_2_name\": \"$PLAYER_2_NAME\"
	}"

	# APIへのPOSTリクエスト
	curl -X POST -k $API_URL \
		-H "Content-Type: application/json" \
		-d "$JSON_DATA"
done
