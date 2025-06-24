import { ethers } from "ethers";
import axios from "axios";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Oracle contract ABI and configuration
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

// CoinGecko API configuration
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

async function testSingleUpdate() {
  try {
    console.log("🧪 Testing single price feed update...");

    if (!process.env.WESTEND_HUB_PK) {
      throw new Error("WESTEND_HUB_PK environment variable is required");
    }

    if (!ORACLE_ADDRESS) {
      throw new Error("WESTEND_ORACLE_MODULE environment variable is required");
    }

    const provider = new ethers.providers.JsonRpcProvider(WESTEND_RPC_URL);
    const wallet = new ethers.Wallet(process.env.WESTEND_HUB_PK, provider);
    const oracleContract = new ethers.Contract(
      ORACLE_ADDRESS,
      ORACLE_ABI,
      wallet
    );

    console.log(`Network: ${WESTEND_RPC_URL}`);
    console.log(`Oracle Address: ${ORACLE_ADDRESS}`);
    console.log(`Wallet Address: ${wallet.address}`);

    // Get current nonce
    const nonce = await provider.getTransactionCount(wallet.address);
    console.log(`📊 Current nonce: ${nonce}`);

    // Get wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Wallet balance: ${ethers.utils.formatEther(balance)} WND`);

    // Fetch Bitcoin price only
    console.log("Fetching Bitcoin price from CoinGecko...");
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: "bitcoin",
        vs_currencies: "usd",
      },
      timeout: 10000,
    });

    const bitcoinPrice = response.data.bitcoin.usd;
    console.log(`📈 Bitcoin price: $${bitcoinPrice}`);

    // Convert to wei (8 decimals) - using parseUnits like the working script
    const priceInWei = ethers.utils.parseUnits(bitcoinPrice.toString(), 8);
    console.log(`💱 Price in wei: ${priceInWei.toString()}`);

    // Check if feed exists
    const feedExists = await oracleContract.feedExists("BTC");
    console.log(`📊 Bitcoin feed exists: ${feedExists}`);

    if (feedExists) {
      console.log("🔄 Updating existing Bitcoin feed...");

      // Don't specify gas manually - let ethers estimate it
      const tx = await oracleContract.updatePrice("BTC", priceInWei);
      console.log(`📝 Transaction sent: ${tx.hash}`);
      console.log("⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

      // Verify the update
      const updatedPrice = await oracleContract.getPrice("BTC");
      console.log(
        `✅ Updated price: ${ethers.utils.formatUnits(updatedPrice, 8)} USD`
      );
    } else {
      console.log("🆕 Creating new Bitcoin feed...");

      // Don't specify gas manually - let ethers estimate it
      const tx = await oracleContract.createFeed("BTC", priceInWei);
      console.log(`📝 Transaction sent: ${tx.hash}`);
      console.log("⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

      // Verify the creation
      const newPrice = await oracleContract.getPrice("BTC");
      console.log(
        `✅ Created price: ${ethers.utils.formatUnits(newPrice, 8)} USD`
      );
    }

    console.log("✅ Single update test completed successfully!");
  } catch (error: any) {
    console.error("❌ Single update test failed:", error);

    if (error.code === 1012) {
      console.log("🔄 Transaction temporarily banned. Try again later.");
    } else if (error.code === 1010) {
      console.log("⚠️ Invalid transaction. Check contract address and ABI.");
    } else if (error.message && error.message.includes("nonce")) {
      console.log("🔄 Nonce issue. Wait for next block and try again.");
    } else if (error.message && error.message.includes("Feed already exists")) {
      console.log("ℹ️ Feed already exists, this is normal.");
    }

    throw error;
  }
}

// Run the test
if (require.main === module) {
  testSingleUpdate()
    .then(() => {
      console.log("Test completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}
