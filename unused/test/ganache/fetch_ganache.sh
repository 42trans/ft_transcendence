#!/bin/bash
# test/ganache/fetch_ganache.sh
# =============================================
# Pongゲームの結果をAPIに送信するスクリプト
# =============================================
API_URL="https://hioikawa.42.fr/pong/api/fetch_testnet/ganache/"
# --- exec ----------
# jq -r '.data[] | @text'
# 取得したJSONから.data配列を抽出
# その要素をテキストとして一行ずつ出力
# -rフラグは:結果をraw文字列として出力するため。引用符を削除
# .data配列を末尾から5件切り出して、それぞれの要素をテキストとして一行ずつ出力
curl -X GET -s -S -k $API_URL | jq -r '.data[-3:][] | @text'
