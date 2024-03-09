#!/bin/bash
# =============================================
# Pongゲームの結果をAPIに送信するスクリプト
# =============================================
API_URL="https://hioikawa.42.fr/pong/save_game_result_hardhat/"
JSON_DATA='{
    "player_1_score": 1,
    "player_2_score": 2,
    "player_1_name": "キュア赤",
    "player_2_name": "キュア青"
}'
# --- exec ----------
# -k: SSL証明書の検証をスキップ
curl -X POST -k $API_URL -H "Content-Type: application/json" -d "$JSON_DATA"
