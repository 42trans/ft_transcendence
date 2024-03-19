// docker/srcs/hardhat/hardhat_pj/hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const INFURA_API_KEY = "9301610ed4c24693b985f80eda16eb67";
const SEPOLIA_PRIVATE_KEY = "894c08080eaa6779d4c084b896b3bc4e42953e0705149cfbc990abee356e14f1";

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    },
    hardhat: {
      dataDir: "./data/chain",
      cacheDir: "./data/cache"
    },
    ganache: {
      url: "http://ganache:8545", 
      // Ganacheから取得したプライベートキー
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", 
                "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",]
    }
  }
};

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

export default config;


