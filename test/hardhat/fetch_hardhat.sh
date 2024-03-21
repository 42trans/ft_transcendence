#!/bin/bash
# test/hardhat/fetch_hardhat.sh
# =============================================
# Pongゲームの結果をAPIに送信するスクリプト
# =============================================
API_URL="https://hioikawa.42.fr/pong/api/fetch_local_testnet/hardhat/"
# --- exec ----------
# jq -r '.data[] | @text'
# 取得したJSONから.data配列を抽出
# その要素をテキストとして一行ずつ出力
# -rフラグは:結果をraw文字列として出力するため。引用符を削除
# .data配列を末尾から5件切り出して、それぞれの要素をテキストとして一行ずつ出力
curl -X GET -k $API_URL | jq -r '.data[-5:][] | @text'
