// docker/srcs/hardhat/hardhat_pj/scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const PongGameResult = await ethers.deployContract("PongGameResult");
    console.log("PongGameResult address:",  await PongGameResult.getAddress());

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  // 参考:【7. Deploying to a live network | Ethereum development environment for professionals by Nomic Foundation】 https://hardhat.org/tutorial/deploying-to-a-live-network#_7-deploying-to-a-live-network