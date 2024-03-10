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
python3 test/hardhat/test_game_result.py

# container_name=uwsgi-django
# match_id=1
# docker exec $container_name python3 /code/pong/view_modules/get_game_result.py $match_id
# ---------------------
# 参考:【Getting started with Hardhat | Ethereum development environment for professionals by Nomic Foundation】 https://hardhat.org/hardhat-runner/docs/getting-started#installation
# ---------------------
# container_name=hardhat
# hardhat_task=test
# outfile=test/hardhat/res_sample_hardhat.txt
# docker exec $container_name npx hardhat $hardhat_task | grep -v 'ms)' | grep -v ' passing' > $outfile
# if diff test/hardhat/expected_sample_hardhat.txt $outfile; then
# 	echo "npx hardhat ${hardhat_task}: ok"
# fi
# # ---------------------
# echo "TODO: head -1で判断するよう修正予定"
# echo "※注意: 雑なテストなので出力は多少（数行程度）違う場合があります。diffがngでも正常な場合があります。下記ファイルを確認ください"
# echo "期待=> test/hardhat/expected_sample_hardhat.txt"
# echo "結果=> $outfile "
