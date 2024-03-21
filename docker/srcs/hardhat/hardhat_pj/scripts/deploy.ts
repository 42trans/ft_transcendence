// docker/srcs/hardhat/hardhat_pj/scripts/deploy.ts
import { ethers } from "hardhat";
import * as fs from "fs";
const path = require('path');

async function main() {
	const [deployer] = await ethers.getSigners();
	const PongGameResult = await ethers.deployContract("PongGameResult");
	// 環境変数からネットワーク名を取得、未設定の場合は'hardhat'を使用
	const networkName = process.env.NETWORK_NAME || 'hardhat';
	// ----------------------------------------------------------
	// Save shared volume
	// ----------------------------------------------------------
	const config = {
		deployer: deployer.address,
		address: await PongGameResult.getAddress(),
	};
	// ファイル名をネットワーク名に基づいて動的に設定
	// ex. ../share/contractInfo-hardhat.json
	const fileName = `contractInfo-${networkName}.json`; 
	fs.writeFileSync(path.join(__dirname, `../share/${fileName}`), JSON.stringify(config, null, 2));
	// ----------------------------------------------------------
	// debug
	// ----------------------------------------------------------
	console.log("deployer.address(account):", deployer.address);
	console.log("PongGameResult.getAddress:",  await PongGameResult.getAddress());
	console.log("config:", config);
	console.log("config:", path.join(__dirname, `../share/${fileName}`));
	// ----------------------------------------------------------
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
});

// 参考:【7. Deploying to a live network | Ethereum development environment for professionals by Nomic Foundation】 https://hardhat.org/tutorial/deploying-to-a-live-network#_7-deploying-to-a-live-network
// 参考:【Migrating away from hardhat-waffle | Ethereum development environment for professionals by Nomic Foundation】 https://hardhat.org/hardhat-runner/docs/advanced/migrating-from-hardhat-waffle
// 参考:【Hardhat Ignition を始める | Nomic Foundationによるプロフェッショナル向けイーサリアム開発環境】 https://hardhat.org/ignition/docs/getting-started#overview