#!/bin/bash
# =============================================
# Pongゲームの結果をAPIに送信するスクリプト
# =============================================
API_URL="https://hioikawa.42.fr/pong/api/save_testnet/sepolia/"
MATCH_ID=$((RANDOM % 1000))
JSON_DATA="{
	\"match_id\": $MATCH_ID,
	\"player_1_score\": 15,
	\"player_2_score\": 2,
	\"player_1_name\": \"キュアハードハット\",
	\"player_2_name\": \"キュア黄\"
}"
# --- exec ----------
# -k: SSL証明書の検証をスキップ
curl -X POST -k $API_URL \
	-H "Content-Type: application/json" \
	-d "$JSON_DATA"
