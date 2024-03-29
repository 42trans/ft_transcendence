#!/bin/sh
# test/hardhat/sample_hardhat.sh

print_result() {
  local status=$1
  local name=$2

  RED="\033[31m"
  GREEN="\033[32m"
  RESET="\033[0m"

  SUCCESS=0

  if [ $status -eq $SUCCESS ]; then
    echo -e " [${GREEN}OK${RESET}] $name"
  else
    echo -e " [${RED}NG${RESET}] $name"
  fi
}


#=======================================================
# include
#=======================================================
TEST_DIR="test/"
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================
echo -e ' 内容: コンテナ起動確認 cmd: docker ps | grep " hardhat "\n'
docker ps | grep " hardhat "
echo -e "\n------------------------------------------------------"
echo -e " 内容: Django から hardhat に接続確認 ping"
echo -e " [cmd]:uwsgi-django ping -c 1 hardhat"
docker exec -it uwsgi-django ping -c 1 hardhat
ping_result=$?

echo -e "\n------------------------------------------------------"
#=======================================================
echo -e " 内容: 🪖Hardhat内の単体テスト💻 "
echo -e " テストファイル: docker/srcs/hardhat/hardhat_pj/test/PongGameResult.test.ts"
echo -e " [cmd]: docker exec hardhat npx hardhat test "
echo -e "------------------------------------------------------"
docker exec hardhat npx hardhat test
unit_test_result=$?

#=======================================================
echo -e "\n------------------------------------------------------"
echo -e " 内容: apiにcurlで📮POST📮 🎸Djangoが🎸 🪖Hardhat🪖テストネットワークにデータを保存💾"
echo -e " [cmd]: sh test/hardhat/save_hardhat.sh"
echo -e "------------------------------------------------------"
POST_OUTPUT=$(sh test/hardhat/save_hardhat.sh)
echo "$POST_OUTPUT"

echo -e "\n------------------------------------------------------"
echo -e " 内容: apiにcurlで📥GET📥  🎸Django🎸 が 🪖Hardhat🪖テストネットワークから最新の数件のデータを取得"
echo -e " [cmd]: sh test/hardhat/fetch_hardhat.sh"
echo -e "------------------------------------------------------"
GET_OUTPUT=$(sh test/hardhat/fetch_hardhat.sh)
echo "$GET_OUTPUT"
echo -e "------------------------------------------------------"
echo -e "直前のPOSTのIDとGETのIDが同一ならばOK"
# 結果から matchId を抽出し、変数に格納。
POST_MATCH_ID=$(echo "$POST_OUTPUT" | jq -r '.saved_game_result.match_id')
GET_MATCH_ID=$(echo "$GET_OUTPUT" | jq -s '.[-1].matchId')
echo "post match_id: $POST_MATCH_ID"
echo "get matchId: $GET_MATCH_ID"
# matchIdが一致するかどうかを確認し、結果を表示
if [ "$POST_MATCH_ID" == "$GET_MATCH_ID" ]; then
    echo -e "\033[1;32m 🪖🪖🪖🪖🪖🪖🪖🪖🪖Hardhat🪖🪖🪖🪖🪖🪖🪖🪖🪖: 起動、Djangoからping接続、保存、取得 全てOK \033[0m"
    save_and_fetch_result=0
else
    echo -e "\033[1;31mNG\033[0m"
    save_and_fetch_result=1
fi

#=======================================================
echo -e "\n\n"
echo "------------------------------------------------------"
echo " 🪖Hardhat🪖 TEST RESULT"
echo "------------------------------------------------------"

print_result $ping_result "hardhat container start-up"
print_result $unit_test_result "hardhat unit test"
print_result $save_and_fetch_result "save & fetch"

total_res=$((ping_result + unit_test_result + save_and_fetch_result))
if [ $total_res -ne 0 ]; then
    exit 1
fi
exit 0
