import { ethers } from "ethers";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Oracle contract ABI
const ORACLE_ABI = [
  "function updatePrice(string _symbol, uint256 _price) external",
  "function getPrice(string _symbol) external view returns (uint256)",
  "function feedExists(string _symbol) external view returns (bool)",
  "function createFeed(string _symbol, uint256 _price) external",
  "function owner() external view returns (address)",
];

// Network configuration
const WESTEND_RPC_URL = "https://westend-asset-hub-eth-rpc.polkadot.io";
const ORACLE_ADDRESS = process.env.WESTEND_ORACLE_MODULE;

async function testOracleConnection() {
  try {
    console.log("🔍 Testing Oracle Contract Connection...");
    console.log(`Network: ${WESTEND_RPC_URL}`);
    console.log(`Oracle Address: ${ORACLE_ADDRESS}`);

    if (!ORACLE_ADDRESS) {
      throw new Error("WESTEND_ORACLE_MODULE environment variable is required");
    }

    // Create provider
    const provider = new ethers.providers.JsonRpcProvider(WESTEND_RPC_URL);

    // Create contract instance (read-only)
    const oracleContract = new ethers.Contract(
      ORACLE_ADDRESS,
      ORACLE_ABI,
      provider
    );

    console.log("✅ Provider and contract instance created");

    // Test 1: Check if contract exists (get code)
    const code = await provider.getCode(ORACLE_ADDRESS);
    if (code === "0x") {
      throw new Error("No contract deployed at the specified address");
    }
    console.log("✅ Contract exists at address");

    // Test 2: Try to get owner
    try {
      const owner = await oracleContract.owner();
      console.log(`✅ Contract owner: ${owner}`);
    } catch (error: any) {
      console.log("⚠️ Could not get owner (function might not exist)");
    }

    // Test 3: Check if specific feeds exist
    const testSymbols = ["BTC", "ETH", "DOT"];

    for (const symbol of testSymbols) {
      try {
        const exists = await oracleContract.feedExists(symbol);
        console.log(
          `📊 Feed for ${symbol}: ${exists ? "EXISTS" : "NOT EXISTS"}`
        );

        if (exists) {
          try {
            const price = await oracleContract.getPrice(symbol);
            console.log(
              `💰 Price for ${symbol}: ${ethers.utils.formatUnits(
                price,
                8
              )} USD`
            );
          } catch (error: any) {
            console.log(
              `❌ Could not get price for ${symbol}: ${error.message}`
            );
          }
        }
      } catch (error: any) {
        console.log(`❌ Error checking feed for ${symbol}: ${error.message}`);
      }
    }

    // Test 4: Check wallet balance if private key is provided
    if (process.env.WESTEND_HUB_PK) {
      const wallet = new ethers.Wallet(process.env.WESTEND_HUB_PK, provider);
      const balance = await provider.getBalance(wallet.address);
      console.log(
        `💰 Wallet balance: ${ethers.utils.formatEther(balance)} WND`
      );
      console.log(`👤 Wallet address: ${wallet.address}`);
    }

    console.log("✅ Oracle connection test completed successfully!");
  } catch (error) {
    console.error("❌ Oracle connection test failed:", error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testOracleConnection()
    .then(() => {
      console.log("Test completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}
