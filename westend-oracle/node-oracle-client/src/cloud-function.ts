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
];

// Hardcoded list of symbols to track with CoinGecko ID mapping
const SYMBOL_MAPPING: { [key: string]: string } = {
  bitcoin: "BTC",
  polkadot: "DOT",
  ethereum: "ETH",
  solana: "SOL",
  tether: "USDT",
  "usd-coin": "USDC",
};

// Get symbols array from mapping
const SYMBOLS = Object.keys(SYMBOL_MAPPING);

// Network configuration
const WESTEND_RPC_URL = "https://westend-asset-hub-eth-rpc.polkadot.io";
const ORACLE_ADDRESS = process.env.WESTEND_ORACLE_MODULE;

// CoinGecko API configuration
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

interface CoinGeckoPrice {
  [symbol: string]: {
    usd: number;
  };
}

class OraclePriceUpdater {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private oracleContract: ethers.Contract;

  constructor() {
    if (!process.env.WESTEND_HUB_PK) {
      throw new Error("WESTEND_HUB_PK environment variable is required");
    }

    if (!ORACLE_ADDRESS) {
      throw new Error("WESTEND_ORACLE_MODULE environment variable is required");
    }

    this.provider = new ethers.providers.JsonRpcProvider(WESTEND_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.WESTEND_HUB_PK, this.provider);
    this.oracleContract = new ethers.Contract(
      ORACLE_ADDRESS,
      ORACLE_ABI,
      this.wallet
    );
  }

  /**
   * Fetch current prices from CoinGecko API
   */
  async fetchPrices(): Promise<CoinGeckoPrice> {
    try {
      console.log("Fetching prices from CoinGecko...");

      const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
        params: {
          ids: SYMBOLS.join(","),
          vs_currencies: "usd",
        },
        timeout: 10000,
      });

      console.log("Prices fetched successfully");
      return response.data;
    } catch (error) {
      console.error("Error fetching prices from CoinGecko:", error);
      throw error;
    }
  }

  /**
   * Convert USD price to wei (18 decimals)
   */
  private usdToWei(usdPrice: number): ethers.BigNumber {
    // Convert USD price to wei (assuming 8 decimals for price precision)
    // This gives us precision up to $0.00000001
    return ethers.utils.parseUnits(usdPrice.toString(), 8);
  }

  /**
   * Update a single price feed
   */
  async updatePriceFeed(coinGeckoId: string, price: number): Promise<void> {
    try {
      const symbol = SYMBOL_MAPPING[coinGeckoId];
      if (!symbol) {
        throw new Error(`No symbol mapping found for ${coinGeckoId}`);
      }

      const priceInWei = this.usdToWei(price);

      // Check if feed exists
      const feedExists = await this.oracleContract.feedExists(symbol);

      if (feedExists) {
        console.log(
          `Updating price for ${symbol} (${coinGeckoId}): $${price} (${priceInWei.toString()} wei)`
        );

        // Don't specify gas manually - let ethers estimate it
        const tx = await this.oracleContract.updatePrice(symbol, priceInWei);
        await tx.wait();
        console.log(`✅ Price updated for ${symbol}. Transaction: ${tx.hash}`);
      } else {
        console.log(
          `Creating new feed for ${symbol} (${coinGeckoId}): $${price} (${priceInWei.toString()} wei)`
        );

        // Don't specify gas manually - let ethers estimate it
        const tx = await this.oracleContract.createFeed(symbol, priceInWei);
        await tx.wait();
        console.log(`✅ Feed created for ${symbol}. Transaction: ${tx.hash}`);
      }
    } catch (error: any) {
      console.error(`❌ Error updating price for ${coinGeckoId}:`, error);

      // Handle specific Substrate errors
      if (error.code === 1012) {
        console.log(
          `🔄 Transaction temporarily banned for ${coinGeckoId}. Waiting longer...`
        );
        // Wait longer for banned transactions
        await new Promise((resolve) => setTimeout(resolve, 10000));
      } else if (error.code === 1010) {
        console.log(
          `⚠️ Invalid transaction for ${coinGeckoId}. This might be a contract issue.`
        );
      } else if (error.message && error.message.includes("nonce")) {
        console.log(`🔄 Nonce issue detected. Waiting for next block...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else if (
        error.message &&
        error.message.includes("Feed already exists")
      ) {
        console.log(
          `ℹ️ Feed already exists for ${coinGeckoId}, this is normal.`
        );
        return; // Don't throw error for this case
      }

      throw error;
    }
  }

  /**
   * Main function to update all price feeds
   */
  async updateAllPrices(): Promise<void> {
    try {
      console.log("🚀 Starting price feed update...");
      console.log(`Network: ${WESTEND_RPC_URL}`);
      console.log(`Oracle Address: ${ORACLE_ADDRESS}`);
      console.log(`Wallet Address: ${this.wallet.address}`);

      // Get current nonce
      const nonce = await this.provider.getTransactionCount(
        this.wallet.address
      );
      console.log(`📊 Current nonce: ${nonce}`);

      // Fetch current prices
      const prices = await this.fetchPrices();

      // Update each price feed with longer delays
      for (const symbol of SYMBOLS) {
        if (prices[symbol] && prices[symbol].usd) {
          try {
            await this.updatePriceFeed(symbol, prices[symbol].usd);

            // Add longer delay between transactions to avoid rate limiting
            console.log(`⏳ Waiting 5 seconds before next transaction...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
          } catch (error: any) {
            console.error(`Failed to update ${symbol}:`, error.message);

            // Continue with next symbol instead of stopping
            if (error.code === 1012) {
              console.log(
                `🔄 Skipping ${symbol} due to rate limiting, continuing with next...`
              );
              continue;
            }
          }
        } else {
          console.warn(`⚠️ No price data available for ${symbol}`);
        }
      }

      console.log("✅ Price feed update completed!");
    } catch (error: any) {
      console.error("❌ Error updating price feeds:", error);
      throw error;
    }
  }

  /**
   * Get current price from oracle
   */
  async getCurrentPrice(symbol: string): Promise<ethers.BigNumber> {
    try {
      const price = await this.oracleContract.getPrice(symbol);
      return price;
    } catch (error) {
      console.error(`Error getting price for ${symbol}:`, error);
      throw error;
    }
  }
}

/**
 * Cloud function entry point
 */
export async function updatePriceFeeds(): Promise<void> {
  const updater = new OraclePriceUpdater();
  await updater.updateAllPrices();
}

/**
 * For local testing
 */
if (require.main === module) {
  updatePriceFeeds()
    .then(() => {
      console.log("Price feed update completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Price feed update failed:", error);
      process.exit(1);
    });
}
