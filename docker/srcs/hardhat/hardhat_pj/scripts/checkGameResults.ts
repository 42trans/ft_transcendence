import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const currentDir = __dirname;
    const abiPath = path.join(currentDir, '../artifacts/contracts/PongGameResult.sol/PongGameResult.json'); // パスはプロジェクトに合わせて調整してください
    const rawAbi = fs.readFileSync(abiPath).toString();
    const contractAbi = JSON.parse(rawAbi).abi;

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // 使用しているコントラクトのアドレスに置き換えてください

    // Hardhatから提供されるプロバイダーを使用
    const contract = new ethers.Contract(contractAddress, contractAbi, ethers.provider);

    // コントラクトからデータを取得
    try {
        const results = await contract.getAllGameResults();
        console.log("Saved game results:", results);
    } catch (error) {
        console.error("Error retrieving saved game results:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
