#!/bin/bash

# -o /dev/null: curlの出力を/dev/nullに
# -w "%{http_code}\n": HTTPレスポンスコードを出力　※それを変数に
# -k: 証明書skip
echo "test GET https://localhost"
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k https://localhost)
if [ "$RESPONSE_CODE" = "200" ]; then
    echo "200 ok"
else
    echo "ng. Response code: $RESPONSE_CODE"
fi

echo -e "\\ntest GET https://hioikawa.42.fr"
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k https://hioikawa.42.fr)
if [ "$RESPONSE_CODE" = "200" ]; then
    echo "200 ok"
else
    echo "ng. Response code: $RESPONSE_CODE"
fi
