#!/bin/sh
# test/hardhat/sample_hardhat.sh

# ---------------------
# 参考:【Getting started with Hardhat | Ethereum development environment for professionals by Nomic Foundation】 https://hardhat.org/hardhat-runner/docs/getting-started#installation
# ---------------------
container_name=hardhat
hardhat_task=test
docker exec $container_name npx hardhat $hardhat_task | grep -v 'ms)' | grep -v ' passing' > test/result/res_sample_hardhat.txt
if diff test/hardhat/expected_sample_hardhat.txt test/result/res_sample_hardhat.txt; then
	echo "npx hardhat ${hardhat_task}: ok"
fi
# ---------------------
# ---------------------
container_name=hardhat
hardhat_task=test
docker exec $container_name npx hardhat $hardhat_task | grep -v 'ms)' | grep -v ' passing' > test/result/res_sample_hardhat.txt
if diff test/hardhat/expected_sample_hardhat.txt test/result/res_sample_hardhat.txt; then
	echo "npx hardhat ${hardhat_task}: ok"
fi
# ---------------------