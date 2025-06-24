import { ethers } from "ethers";

// Oracle contract ABI - simplified for the functions we need
const ORACLE_ABI = [
  "function getPrice(string memory _symbol) public view returns (uint256)",
  "function getLastUpdated(string memory _symbol) public view returns (uint256)",
  "function feedExists(string memory _symbol) public view returns (bool)",
  "function prices(string memory _symbol) public view returns (uint256)",
  "function lastUpdated(string memory _symbol) public view returns (uint256)",
  "function isActive(string memory _symbol) public view returns (bool)",
];

async function testOracle() {
  const oracleAddress = "0xe00A3f1e5a9f857F2893ce3234465714a24f04Ef";

  // Westend Asset Hub RPC URL
  const rpcUrl = "https://westend-asset-hub-eth-rpc.polkadot.io";

  console.log("🔍 Testing Oracle Contract...");
  console.log("📋 Oracle address:", oracleAddress);
  console.log("🌐 RPC URL:", rpcUrl);

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log("✅ Provider created successfully");

    // Create contract instance
    const oracleContract = new ethers.Contract(
      oracleAddress,
      ORACLE_ABI,
      provider
    );
    console.log("✅ Contract instance created successfully");

    // Test symbols
    const symbols = ["BTC", "ETH", "SOL", "ADA"];

    for (const symbol of symbols) {
      try {
        console.log(`\n🔍 Testing ${symbol}...`);

        const exists = await oracleContract.feedExists(symbol);
        console.log(`   Feed exists: ${exists}`);

        if (exists) {
          const price = await oracleContract.getPrice(symbol);
          const lastUpdated = await oracleContract.getLastUpdated(symbol);
          const isActive = await oracleContract.isActive(symbol);

          console.log(`   Price: ${ethers.formatUnits(price, 8)} USD`);
          console.log(
            `   Last updated: ${new Date(
              Number(lastUpdated) * 1000
            ).toLocaleString()}`
          );
          console.log(`   Is active: ${isActive}`);
        } else {
          console.log(`   ⚠️ Feed does not exist for ${symbol}`);
        }
      } catch (err) {
        console.error(`   ❌ Error testing ${symbol}:`, err.message);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testOracle();
