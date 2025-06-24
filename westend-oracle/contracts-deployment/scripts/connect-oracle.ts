import { ethers } from "hardhat";
import { OracleUpgradeable } from "../typechain-types";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  console.log("Connecting to deployed Oracle contract on Westend...");

  // Get the Oracle contract address from environment variable
  const oracleAddress = process.env.WESTEND_ORACLE_MODULE;

  if (!oracleAddress) {
    throw new Error("WESTEND_ORACLE_MODULE environment variable is not set");
  }

  console.log(`Oracle contract address: ${oracleAddress}`);

  // Get the Oracle contract instance - use OracleUpgradeable instead of Oracle
  const OracleFactory = await ethers.getContractFactory("OracleUpgradeable");
  const oracle = OracleFactory.attach(oracleAddress) as OracleUpgradeable;

  // Verify the contract is deployed and accessible
  let owner: string;
  try {
    owner = await oracle.owner();
    console.log(`✓ Oracle owner: ${owner}`);
  } catch (error) {
    throw new Error(
      `Failed to connect to Oracle contract at ${oracleAddress}: ${error}`
    );
  }

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`✓ Connected with account: ${deployer.address}`);

  // Check if the connected account is the owner
  if (owner !== deployer.address) {
    console.log(
      `⚠️  Warning: Connected account (${deployer.address}) is not the Oracle owner (${owner})`
    );
    console.log("This means you won't be able to create or update feeds.");
    console.log("You can still read existing feeds.");

    // Test read-only operations only
    console.log("\n🧪 Testing Oracle read-only functionality...");

    // Check if any feeds exist
    const testSymbols = ["BTC", "ETH", "SOL", "ADA"];
    for (const symbol of testSymbols) {
      try {
        const exists = await oracle.feedExists(symbol);
        if (exists) {
          const price = await oracle.getPrice(symbol);
          console.log(
            `✅ ${symbol} feed exists: ${ethers.formatUnits(price, 8)} USD`
          );
        } else {
          console.log(`ℹ️  ${symbol} feed does not exist`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${symbol} feed:`, error);
      }
    }

    console.log("\n🔧 To fix this issue, you need to:");
    console.log("1. Deploy the Oracle contract with the correct owner");
    console.log("2. Or transfer ownership to your account");
    console.log("3. Or use the account that is currently the owner");

    return;
  }

  // Test Oracle functionality
  console.log("\n🧪 Testing Oracle functionality...");

  // Step 1: Create a test feed
  console.log("\n1. Creating BTC feed...");
  try {
    const tx1 = await oracle.createFeed("BTC", ethers.parseUnits("50000", 8));
    await tx1.wait();
    console.log("✅ Created BTC feed successfully");
  } catch (error: any) {
    if (error.message.includes("Feed already exists")) {
      console.log("ℹ️  BTC feed already exists, continuing...");
    } else {
      console.error("❌ Failed to create BTC feed:", error.message);
      throw error;
    }
  }

  // Step 2: Get the current price
  console.log("\n2. Getting BTC price...");
  try {
    const btcPrice = await oracle.getPrice("BTC");
    console.log(`✅ BTC price: ${ethers.formatUnits(btcPrice, 8)} USD`);
  } catch (error) {
    console.error("❌ Failed to get BTC price:", error);
    throw error;
  }

  // Step 3: Update the price
  console.log("\n3. Updating BTC price...");
  try {
    const tx2 = await oracle.updatePrice("BTC", ethers.parseUnits("51000", 8));
    await tx2.wait();
    console.log("✅ Updated BTC price successfully");
  } catch (error) {
    console.error("❌ Failed to update BTC price:", error);
    throw error;
  }

  // Step 4: Get updated price
  console.log("\n4. Getting updated BTC price...");
  try {
    const updatedBtcPrice = await oracle.getPrice("BTC");
    console.log(
      `✅ Updated BTC price: ${ethers.formatUnits(updatedBtcPrice, 8)} USD`
    );
  } catch (error) {
    console.error("❌ Failed to get updated BTC price:", error);
    throw error;
  }

  // Step 5: Check if feed exists
  console.log("\n5. Verifying feed existence...");
  try {
    const exists = await oracle.feedExists("BTC");
    console.log(`✅ BTC feed exists: ${exists}`);
  } catch (error) {
    console.error("❌ Failed to check feed existence:", error);
    throw error;
  }

  // Step 6: Create additional feeds for testing
  console.log("\n6. Creating additional test feeds...");

  const testFeeds = [
    { symbol: "ETH", price: "3000" },
    { symbol: "SOL", price: "100" },
    { symbol: "ADA", price: "0.5" },
  ];

  for (const feed of testFeeds) {
    try {
      const tx = await oracle.createFeed(
        feed.symbol,
        ethers.parseUnits(feed.price, 8)
      );
      await tx.wait();
      console.log(`✅ Created ${feed.symbol} feed`);

      const price = await oracle.getPrice(feed.symbol);
      console.log(
        `   ${feed.symbol} price: ${ethers.formatUnits(price, 8)} USD`
      );
    } catch (error: any) {
      if (error.message.includes("Feed already exists")) {
        console.log(`ℹ️  ${feed.symbol} feed already exists`);
      } else {
        console.error(
          `❌ Failed to create ${feed.symbol} feed:`,
          error.message
        );
      }
    }
  }

  // Step 7: Test price updates for all feeds
  console.log("\n7. Testing price updates for all feeds...");

  const updatedPrices = [
    { symbol: "BTC", price: "52000" },
    { symbol: "ETH", price: "3100" },
    { symbol: "SOL", price: "105" },
    { symbol: "ADA", price: "0.52" },
  ];

  for (const feed of updatedPrices) {
    try {
      const tx = await oracle.updatePrice(
        feed.symbol,
        ethers.parseUnits(feed.price, 8)
      );
      await tx.wait();
      console.log(`✅ Updated ${feed.symbol} price`);

      const price = await oracle.getPrice(feed.symbol);
      console.log(
        `   ${feed.symbol} new price: ${ethers.formatUnits(price, 8)} USD`
      );
    } catch (error) {
      console.error(`❌ Failed to update ${feed.symbol} price:`, error);
    }
  }

  // Step 8: Test non-existent feed
  console.log("\n8. Testing non-existent feed...");
  try {
    const exists = await oracle.feedExists("NONEXISTENT");
    console.log(`✅ NONEXISTENT feed exists: ${exists}`);
  } catch (error) {
    console.error("❌ Failed to check non-existent feed:", error);
  }

  console.log("\n🎉 All Oracle functionality tests completed successfully!");
  console.log(`📋 Oracle contract address: ${oracleAddress}`);
  console.log(`👤 Connected account: ${deployer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
