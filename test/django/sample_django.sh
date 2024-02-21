#!/bin/bash

# -o /dev/null: curlの出力を/dev/nullに
# -w "%{http_code}\n": HTTPレスポンスコードを出力　※それを変数に
# -k: 証明書skip
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k https://localhost)

if [ "$RESPONSE_CODE" = "200" ]; then
    echo "Django ok"
else
    echo "Django ng. Response code: $RESPONSE_CODE"
fi

RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k https://hioikawa.42.fr)

if [ "$RESPONSE_CODE" = "200" ]; then
    echo "Django ok"
else
    echo "Django ng. Response code: $RESPONSE_CODE"
fi
