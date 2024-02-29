#!/bin/sh
# test/hardhat/sample_hardhat.sh

# ---------------------
# 参考:【Getting started with Hardhat | Ethereum development environment for professionals by Nomic Foundation】 https://hardhat.org/hardhat-runner/docs/getting-started#installation
# ---------------------
container_name=hardhat
hardhat_task=test
outfile=test/hardhat/res_sample_hardhat.txt
docker exec $container_name npx hardhat $hardhat_task | grep -v 'ms)' | grep -v ' passing' > $outfile
if diff test/hardhat/expected_sample_hardhat.txt $outfile; then
	echo "npx hardhat ${hardhat_task}: ok"
fi
# ---------------------
echo "TODO: head -1で判断するよう修正予定"
echo "※注意: 雑なテストなので出力は多少（数行程度）違う場合があります。diffがngでも正常な場合があります。下記ファイルを確認ください"
echo "期待: test/hardhat/expected_sample_hardhat.txt"
echo "結果: $outfile "
