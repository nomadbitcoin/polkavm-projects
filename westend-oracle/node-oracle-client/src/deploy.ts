import { ethers } from "ethers";
import * as SimpleOracle from "../src/contracts/SimpleOracle.json";
import * as MockERC20 from "../src/contracts/MockERC20.json";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const signer = provider.getSigner();

  console.log("Deploying MockERC20 (BTC)...");
  const MockERC20Factory = new ethers.ContractFactory(MockERC20.abi, MockERC20.bytecode, signer);
  const btc = await MockERC20Factory.deploy("Bitcoin", "BTC");
  await btc.deployed();
  console.log("BTC deployed to:", btc.address);

  console.log("Deploying MockERC20 (USDT)...");
  const usdt = await MockERC20Factory.deploy("Tether USD", "USDT");
  await usdt.deployed();
  console.log("USDT deployed to:", usdt.address);

  console.log("Deploying SimpleOracle...");
  const SimpleOracleFactory = new ethers.ContractFactory(SimpleOracle.abi, SimpleOracle.bytecode, signer);
  const oracle = await SimpleOracleFactory.deploy();
  await oracle.deployed();
  console.log("SimpleOracle deployed to:", oracle.address);

  // Store addresses for later use
  console.log("\nContract Addresses:");
  console.log("BTC:", btc.address);
  console.log("USDT:", usdt.address);
  console.log("SimpleOracle:", oracle.address);

  // Example of updating prices
  console.log("\nUpdating BTC price...");
  const btcPrice = ethers.utils.parseUnits("30000", 8); // 30000 with 8 decimals
  const tx1 = await oracle.updatePrice("BTC", btcPrice);
  await tx1.wait();
  console.log("BTC price updated. Gas used:", (await provider.getTransactionReceipt(tx1.hash)).gasUsed.toString());

  console.log("Updating USDT price...");
  const usdtPrice = ethers.utils.parseUnits("1", 6); // 1 with 6 decimals
  const tx2 = await oracle.updatePrice("USDT", usdtPrice);
  await tx2.wait();
  console.log("USDT price updated. Gas used:", (await provider.getTransactionReceipt(tx2.hash)).gasUsed.toString());

  console.log("\nFetching prices from oracle:");
  console.log("BTC Price:", ethers.utils.formatUnits(await oracle.getPrice("BTC"), 8));
  console.log("USDT Price:", ethers.utils.formatUnits(await oracle.getPrice("USDT"), 6));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


