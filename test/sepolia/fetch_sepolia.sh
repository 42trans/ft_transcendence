#!/bin/bash

# sepoliaのAPIに直接
API_URL="https://sepolia.infura.io/v3/9301610ed4c24693b985f80eda16eb67"
curl -X POST -k $API_URL \
	-H "Content-Type: application/json" \
	-d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Django経由
API_URL="https://hioikawa.42.fr/pong/api/fetch_testnet/sepolia/"
curl -X GET -k $API_URL
# 最新5件の出力
# curl -X GET -k $API_URL | jq -r '.data[-5:][] | @text'

