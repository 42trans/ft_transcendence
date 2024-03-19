// scripts/interact.ts
import { ethers } from "hardhat";

async function main() {
    // Deployされたコントラクトのアドレス
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    // コントラクトのインスタンスを取得
    const PongGameResult = await ethers.getContractAt("PongGameResult", contractAddress);

    // コントラクトの関数を呼び出す例
    const response = await PongGameResult.getAllGameResults();
    console.log('Response:', response);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
