#!/bin/sh

# pgAdminのURL
URL="http://localhost:80"

# curlコマンドを使用してHTTPヘッダーを取得
response=$(curl -I -s $URL)

# HTTPステータスコードを取得
status_code=$(echo "$response" | grep HTTP | awk '{print $2}')

# リダイレクト先を取得
location=$(echo "$response" | grep Location | awk '{print $2}')

# ステータスコードが302（Found）であることを確認
if [ "$status_code" = "302" ]; then
    echo "Status code: $status_code"
    # リダイレクト先が/loginであることを確認
    if echo "$location" | grep -q "/login"; then
        echo "pgAdmin ok: Redirecting to: $location"
    else
        echo "ng location: $location"
    fi
else
    echo "ng status code: $status_code"
fi
