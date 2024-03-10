#!/bin/sh
# test/hardhat/sample_hardhat.sh
#=======================================================
# include
#=======================================================
TEST_DIR="test/"
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================
echo -e 'cmd: docker ps | grep " hardhat "\n'
docker ps | grep " hardhat "
#=======================================================

echo -e "\n------------------------------------------------------"
echo -e " 内容: apiにcurlでPOST📮 Djangoが🪖Hardhatテストネットワークにデータを保存💾"
echo -e " cmd: sh test/hardhat/save_game_result_json_hardhat.sh"
echo -e "------------------------------------------------------"
sh test/hardhat/save_game_result_json_hardhat.sh

echo -e "\n------------------------------------------------------"
echo -e " 内容: apiにcurlでGET⬇ Djangoが🪖Hardhatネットワークからデータを取得"
echo -e " cmd: sh test/hardhat/get_game_result_json_hardhat.sh"
echo -e "------------------------------------------------------"
sh test/hardhat/get_game_result_json_hardhat.sh

echo -e "\n------------------------------------------------------"
echo -e " 内容: 🪖Hardhat内の単体テスト💻 ※docker/srcs/hardhat/hardhat_pj/test/PongGameResult.test.ts"
echo -e " cmd: docker exec hardhat npx hardhat test "
echo -e "------------------------------------------------------"
docker exec hardhat npx hardhat test

# ---------------------
# 参考:【Getting started with Hardhat | Ethereum development environment for professionals by Nomic Foundation】 https://hardhat.org/hardhat-runner/docs/getting-started#installation
