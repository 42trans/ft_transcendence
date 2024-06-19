#!/bin/sh
#=======================================================
# include
#=======================================================
TEST_DIR="test/"
if [ -z "$COLOR_SH" ]; then
source "${TEST_DIR}color.sh"
COLOR_SH=true
fi
#=======================================================
echo -e "内容: sepoliaのAPIに直接リクエスト method":"eth_blockNumber"
echo -e "------------------------------------------------------"
API_URL="https://sepolia.infura.io/v3/9301610ed4c24693b985f80eda16eb67"
curl -X POST -k $API_URL \
-H "Content-Type: application/json" \
-d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

echo -e "\n------------------------------------------------------"
echo -e " 内容: apiにcurlで📮POST📮 🎸Djangoが🎸 🐬sepolia🐬テストネットワークにデータを保存💾"
echo -e " [cmd]: sh test/sepolia/save_sepolia.sh"
echo -e "------------------------------------------------------"
# echo -e "eth節約のためにコメントアウトしてます。 test/sepolia/test_main_sepolia.shを編集してください"
POST_OUTPUT=$(sh test/sepolia/save_sepolia.sh)
echo "$POST_OUTPUT"

echo -e "------------------------------------------------------"
echo -e " 内容: apiにcurlで📥GET📥 🎸Django🎸が 🐬sepolia🐬 テストネットワークから最新の数件のデータを取得"
echo -e " [cmd]: sh test/sepolia/fetch_sepolia.sh"
echo -e "------------------------------------------------------"
GET_OUTPUT=$(sh test/sepolia/fetch_sepolia.sh)
echo "$GET_OUTPUT"

echo -e "------------------------------------------------------"
echo -e "直前のPOSTのIDとGETのIDが同一ならばOK"
# # 結果から matchId を抽出し、変数に格納。
POST_MATCH_ID=$(echo "$POST_OUTPUT" | jq -r '.saved_game_result.match_id')
GET_MATCH_ID=$(echo "$GET_OUTPUT" | jq -s '.[-1].matchId')
echo "post match_id: $POST_MATCH_ID"
echo "get matchId: $GET_MATCH_ID"
# matchIdが一致するかどうかを確認し、結果を表示
if [ "$POST_MATCH_ID" == "$GET_MATCH_ID" ]; then
    echo -e "\033[1;32m 🐬🐬🐬🐬🐬🐬🐬🐬🐬Sepolia🐬🐬🐬🐬🐬🐬🐬🐬🐬: 保存、取得 OK \033[0m"
else
    echo -e "\033[1;31mNG\033[0m"
fi
