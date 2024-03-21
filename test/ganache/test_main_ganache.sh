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
echo -e '[cmd]: docker ps | grep " ganache "\n'
docker ps | grep " ganache "
#=======================================================
# echo -e "\n--- [cmd]:ping ------------------------------------------------"
# docker exec -it uwsgi-django ping -c 1 ganache
#=======================================================
echo -e "\n------------------------------------------------------"
echo -e " 内容: apiにcurlで📮POST📮: 🎸Django🎸が、🍫ganache🍫の🌏テストネットワーク🌏に💾データを保存💾"
echo -e " [cmd]: sh test/ganache/save_api_game_result_ganache.sh"
echo -e "------------------------------------------------------"
sh test/ganache/save_api_game_result_ganache.sh --verbose

echo -e "\n------------------------------------------------------"
echo -e " 内容: apiにcurlで 📥GET📥: 🎸Django🎸で、🍫ganache🍫の🌏テストネットワーク🌏から、最新の数件"

echo -e " [cmd]: sh test/ganache/get_api_all_result_ganache.sh"
echo -e "------------------------------------------------------"

sh test/ganache/get_api_all_result_ganache.sh
