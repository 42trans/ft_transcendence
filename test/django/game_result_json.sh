#!/bin/bash
# =============================================
# Pongゲームの結果をAPIに送信するスクリプト
# =============================================
API_URL="https://hioikawa.42.fr/pong/api/save_game_result/"
JSON_DATA='{
    "match_id": 1,
    "player_1_score": 2,
    "player_2_score": 1,
    "player_1_name": "キュア白",
    "player_2_name": "キュア黒"
}'
# --- exec ----------
# -k: SSL証明書の検証をスキップ
curl -X POST -k $API_URL -H "Content-Type: application/json" -d "$JSON_DATA"
