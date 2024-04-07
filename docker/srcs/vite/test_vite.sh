#!/bin/bash

# Viteが動作しているポート
PORT=5184

# curlコマンドでlocalhostのPORTにリクエストを送信し、応答があるかどうかを確認
response=$(curl --write-out '%{http_code}' --silent --output /dev/null localhost:$PORT)

# 応答コードが200（OK）の場合、Viteは動作していると見なす
if [ "$response" -eq 200 ]; then
    echo "OK port $PORT!"
else
    echo "NG port $PORT. Response code: $response"
fi

echo "------------logs vite:---------------"
docker logs vite