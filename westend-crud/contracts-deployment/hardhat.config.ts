import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@parity/hardhat-polkadot";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  resolc: {
    compilerSource: "npm",
  },
  networks: {
    hardhat: {
      polkavm: true,
      forking: {
        url: "wss://westend-asset-hub-rpc.polkadot.io",
      },
    },
    localNode: {
      polkavm: true,
      url: `http://127.0.0.1:8545`,
    },
    westendAssetHub: {
      polkavm: true,
      url: "https://westend-asset-hub-eth-rpc.polkadot.io",
      accounts: [process.env.WESTEND_HUB_PK || ""],
    },
  },
};

export default config;
