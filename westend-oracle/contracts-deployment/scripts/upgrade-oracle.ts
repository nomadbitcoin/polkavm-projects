import { ethers } from "hardhat";

async function main() {
  console.log("Upgrading Oracle contract...");

  // Get the deployer
  const [deployer] = await ethers.getSigners();
  console.log("Upgrading with account:", deployer.address);

  // Get the addresses from environment
  const oracleModuleAddress = process.env.WESTEND_ORACLE_MODULE;

  if (!oracleModuleAddress) {
    throw new Error("WESTEND_ORACLE_MODULE environment variable is required");
  }

  console.log(
    "Oracle module address (for all operations):",
    oracleModuleAddress
  );

  // Get the oracle contract for all operations (proxy address)
  const oracle = await ethers.getContractAt(
    "OracleUpgradeable",
    oracleModuleAddress
  );

  // Cast to UUPSUpgradeable to access upgrade functions
  const uupsProxy = oracle as any; // Cast to access upgradeToAndCall

  // Check existing data before upgrade (using oracle for reading)
  console.log("Checking existing data before upgrade...");
  const existingFeeds = ["BTC", "ETH", "SOL", "DOT"];
  const existingData: { [key: string]: { price: bigint; exists: boolean } } =
    {};

  for (const symbol of existingFeeds) {
    try {
      const exists = await oracle.feedExists(symbol);
      if (exists) {
        const price = await oracle.getPrice(symbol);
        existingData[symbol] = { price, exists: true };
        console.log(
          `✅ ${symbol} exists with price: ${ethers.formatUnits(price, 8)} USD`
        );
      } else {
        existingData[symbol] = { price: 0n, exists: false };
        console.log(`ℹ️  ${symbol} does not exist`);
      }
    } catch (error) {
      console.log(`❌ Error checking ${symbol}:`, error);
      existingData[symbol] = { price: 0n, exists: false };
    }
  }

  // Deploy the new implementation contract
  console.log("\nDeploying new OracleUpgradeable implementation...");
  const OracleUpgradeable = await ethers.getContractFactory(
    "OracleUpgradeable"
  );
  const newImplementation = await OracleUpgradeable.deploy();
  await newImplementation.waitForDeployment();
  const newImplementationAddress = await newImplementation.getAddress();
  console.log(
    "New OracleUpgradeable implementation deployed to:",
    newImplementationAddress
  );

  // Upgrade the proxy (using proxy address for admin operation)
  console.log("Upgrading proxy to new implementation...");
  const upgradeTx = await uupsProxy.upgradeToAndCall(
    newImplementationAddress,
    "0x"
  );
  await upgradeTx.wait();
  console.log("Upgrade completed successfully!");

  // Verify the upgrade by checking the version (using oracle for reading)
  const version = await oracle.version();
  console.log("Oracle version after upgrade:", version);

  // Verify that existing data is preserved (using oracle for reading)
  console.log("\nVerifying data preservation after upgrade...");
  let dataPreserved = true;

  for (const symbol of existingFeeds) {
    try {
      const exists = await oracle.feedExists(symbol);
      if (existingData[symbol].exists) {
        if (!exists) {
          console.log(
            `❌ UPGRADE FAILED: ${symbol} feed was lost during upgrade`
          );
          dataPreserved = false;
          continue;
        }

        const price = await oracle.getPrice(symbol);
        if (price !== existingData[symbol].price) {
          console.log(
            `❌ UPGRADE FAILED: ${symbol} price changed during upgrade`
          );
          console.log(
            `   Before: ${ethers.formatUnits(
              existingData[symbol].price,
              8
            )} USD`
          );
          console.log(`   After:  ${ethers.formatUnits(price, 8)} USD`);
          dataPreserved = false;
        } else {
          console.log(`✅ ${symbol} data preserved correctly`);
        }
      } else {
        if (exists) {
          console.log(
            `❌ UPGRADE FAILED: ${symbol} feed appeared unexpectedly`
          );
          dataPreserved = false;
        } else {
          console.log(`✅ ${symbol} correctly does not exist (as expected)`);
        }
      }
    } catch (error) {
      console.log(`❌ UPGRADE FAILED: Error verifying ${symbol}:`, error);
      dataPreserved = false;
    }
  }

  if (!dataPreserved) {
    throw new Error("❌ UPGRADE FAILED: Data was not preserved during upgrade");
  }

  console.log("\n✅ All existing data preserved successfully!");

  // Test creating a new feed to ensure functionality works (using proxy for admin operation)
  console.log("\nTesting new feed creation after upgrade...");
  const testSymbol = "MATIC";
  const testPrice = ethers.parseUnits("10", 8);

  const tx = await oracle.createFeed(testSymbol, testPrice);
  await tx.wait();

  // Verify the new feed was created (using oracle for reading)
  const newPrice = await oracle.getPrice(testSymbol);
  console.log(
    `✅ Created ${testSymbol} feed: ${ethers.formatUnits(newPrice, 8)} USD`
  );

  console.log("\n🎉 Oracle upgrade completed successfully!");
  console.log(
    "Oracle module address (for all operations):",
    oracleModuleAddress
  );
  console.log("New implementation address:", newImplementationAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Upgrade failed:", error);
    process.exit(1);
  });
