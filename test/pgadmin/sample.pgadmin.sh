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
    # リダイレクト先が/loginであることを確認
    if echo "$location" | grep -q "/login"; then
        echo "ok: Redirect先: 期待"/login?next=%2F": 結果:$location"
        echo "Status code: 期待"302": 結果:$status_code"
    else
        echo "ng location: $location"
    fi
else
    echo "ng status code: $status_code"
fi
