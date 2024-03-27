#!/bin/bash
# test/hardhat/fetch_hardhat.sh
# =============================================
# Pongゲームの結果をAPIに送信するスクリプト
# =============================================
API_URL="https://localhost/pong/results/"
# --- exec ----------
# jq -r '.data[] | @text'
# 取得したJSONから.data配列を抽出
# その要素をテキストとして一行ずつ出力
# -rフラグは:結果をraw文字列として出力するため。引用符を削除
# .data配列を末尾から5件切り出して、それぞれの要素をテキストとして一行ずつ出力
curl -X GET -s -S -k $API_URL | grep '<h1>pongゲーム結果</h1>'
# curl -X GET -s -S -k $API_URL | jq -r '.data[-3:][] | @text'
