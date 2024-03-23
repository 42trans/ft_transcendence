#!/bin/bash

# Django経由
API_URL="https://hioikawa.42.fr/pong/api/fetch_testnet/sepolia/"
# curl -X GET -k $API_URL
# 最新5件の出力
curl -X GET -s -S -k $API_URL | jq -r '.data[-3:][] | @text'

