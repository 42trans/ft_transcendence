#!/bin/sh
TEST_DIR="test/"
#=======================================================
# include
#=======================================================
if [ -z "$COLOR_SH" ]; then
source "${TEST_DIR}color.sh"
COLOR_SH=true
fi
#=======================================================

# pgAdminのURL
URL="http://localhost:${PGADMIN_PORT}"

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
        echo "${ESC}${GREEN}"

        echo "ok: Redirect先"
        echo "期待"/login?next=%2F""
        echo "結果:$location"
        echo "Status code: 期待"302": 結果:$status_code"
        echo "${ESC}${COLOR180}"

    else
        echo "${ESC}${RED}"

        echo "ng location: $location"
        echo "${ESC}${COLOR180}"
        echo "${ESC}${COLOR180}"
    fi
else
        echo "${ESC}${RED}"
    echo "ng status code: $status_code"
        echo "${ESC}${COLOR180}"
fi
