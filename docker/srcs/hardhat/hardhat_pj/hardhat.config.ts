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
    }
  }
};

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

export default config;


