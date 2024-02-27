#!/bin/bash
# test/frontend/bootstrap/sample_bootstrap.sh

# -o /dev/null: curlの出力を/dev/nullに
# -w "%{http_code}\n": HTTPレスポンスコードを出力　※それを変数に
# -k: 証明書skip
echo "test GET http://localhost:${FRONTEND_PORT}"
RESPONSE_CODE=$(curl -o /dev/null -s  -w "%{http_code}\n" -k http://localhost:${FRONTEND_PORT})
if [ "$RESPONSE_CODE" = "200" ]; then
    echo "200 ok"
else
    echo "ng. Response code: $RESPONSE_CODE"
fi
