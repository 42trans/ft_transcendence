#!/bin/sh
# test/ganache/test_main_ganache.sh
#=======================================================
# include
#=======================================================
TEST_DIR="test/"
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================
echo -e '内容：コンテナ起動確認 [cmd]: docker ps | grep " ganache "\n'
docker ps | grep " ganache "
echo -e "\n------------------------------------------------------"
echo -e " 内容: Django から ganache に接続確認 ping"
echo -e " [cmd]:uwsgi-django ping -c 1 ganache"
docker exec -it uwsgi-django ping -c 1 ganache
#=======================================================
echo -e "\n------------------------------------------------------"
echo -e "Django API へリクエスト"
echo -e "\n------------------------------------------------------"
echo -e " 内容: apiにcurlで📮POST📮: 🎸Django🎸が、🍫ganache🍫の🌏テストネットワーク🌏に💾データを保存💾"
echo -e " [cmd]: sh test/ganache/save_ganache.sh"
echo -e "------------------------------------------------------"
# save_ganache.sh スクリプトを実行し、結果を変数に格納
POST_OUTPUT=$(sh test/ganache/save_ganache.sh)
echo "$POST_OUTPUT"

echo -e "\n------------------------------------------------------"
echo -e " 内容: apiにcurlで 📥GET📥: 🎸Django🎸で、🍫ganache🍫の🌏テストネットワーク🌏から、最新の数件のデータを取得"
echo -e " [cmd]: sh test/ganache/fetch_ganache.sh"
echo -e "------------------------------------------------------"
GET_OUTPUT=$(sh test/ganache/fetch_ganache.sh)
echo "$GET_OUTPUT"

echo -e "------------------------------------------------------"
echo -e "直前のPOSTのIDとGETのIDが同一ならばOK"
echo -e "------------------------------------------------------"
# 結果から matchId を抽出し、変数に格納。
POST_MATCH_ID=$(echo "$POST_OUTPUT" | jq -r '.saved_game_result.match_id')
GET_MATCH_ID=$(echo "$GET_OUTPUT" | jq -s '.[-1].matchId')
echo "post match_id: $POST_MATCH_ID"
echo "get matchId: $GET_MATCH_ID"
# matchIdが一致するかどうかを確認し、結果を表示
if [ "$POST_MATCH_ID" == "$GET_MATCH_ID" ]; then
    echo -e "\033[1;32m Ganache: 起動、Djangoからping接続、保存、取得 全てOK \033[0m"
else
    echo -e "\033[1;31mNG\033[0m"
fi
