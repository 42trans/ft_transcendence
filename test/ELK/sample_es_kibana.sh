#!/bin/bash

USERNAME="elastic"
PASSWORD="7e9ce2714d526b9a3ac54f4e7a945bfa"

# -o /dev/null: curlの出力を/dev/nullに
# -w "%{http_code}\n": HTTPレスポンスコードを出力　※それを変数に
# -k: 証明書skip
echo "kibana test GET http://localhost:${KIBANA_PORT}/api/status"
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k http://localhost:${KIBANA_PORT}/api/status -u $USERNAME:$PASSWORD)
if [ "$RESPONSE_CODE" = "200" ]; then
    echo "200 ok"
else
    echo "ng. Response code: $RESPONSE_CODE"
fi

echo -e "\\nkibana test GET https://hioikawa.42.fr/api/status"
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k https://hioikawa.42.fr/api/status -u $USERNAME:$PASSWORD)
if [ "$RESPONSE_CODE" = "200" ]; then
    echo "200 ok"
else
    echo "ng. Response code: $RESPONSE_CODE"
fi
