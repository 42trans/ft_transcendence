#!/bin/bash
# test/django/game_result_json_hardhat.sh
# =============================================
# Pongゲームの結果をAPIに送信するスクリプト
# =============================================
API_URL="https://hioikawa.42.fr/pong/get_all_results_from_hardhat/"
MATCH_ID=3
# -k: SSL証明書の検証をスキップ
curl -X GET -k $API_URL -d "match_id=$MATCH_ID" -H "Content-Type: application/json"