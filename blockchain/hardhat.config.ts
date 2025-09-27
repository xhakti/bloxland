import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";

import "dotenv/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },
    sepolia: {
      type: "http",
      chainId: 11155111,
      chainType: "l1",
      // url: "https://sepolia.drpc.org",
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
    },
    'base-mainnet': {
      type: "http",
      chainId: 8453,
      url: "https://mainnet.base.org",
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
      gasPrice: 1000000000,
    },
    'base-sepolia': {
      type: "http",
      chainId: 84532,
      url: "https://sepolia.base.org",
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
      gasPrice: 1000000000,
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY,
      enabled: process.env.ETHERSCAN_API_KEY ? undefined : false,
    },
  },
};

export default config;
