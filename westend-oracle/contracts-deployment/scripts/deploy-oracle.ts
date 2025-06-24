import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Oracle contracts...");

  // Get the deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy the implementation contract
  console.log("Deploying OracleUpgradeable implementation...");
  const OracleUpgradeable = await ethers.getContractFactory(
    "OracleUpgradeable"
  );
  const oracleImplementation = await OracleUpgradeable.deploy();
  await oracleImplementation.waitForDeployment();
  const implementationAddress = await oracleImplementation.getAddress();
  console.log(
    "OracleUpgradeable implementation deployed to:",
    implementationAddress
  );

  // Prepare initialization data for the proxy
  const oracleInterface = new ethers.Interface([
    "function initialize(address initialOwner)",
  ]);
  const initData = oracleInterface.encodeFunctionData("initialize", [
    deployer.address, // Use the actual deployer address
  ]);

  // Deploy the proxy contract
  console.log("Deploying OracleProxy...");
  const OracleProxy = await ethers.getContractFactory("OracleProxy");
  const oracleProxy = await OracleProxy.deploy(implementationAddress, initData);
  await oracleProxy.waitForDeployment();
  const proxyAddress = await oracleProxy.getAddress();
  console.log("OracleProxy deployed to:", proxyAddress);

  // Verify the deployment by calling a function on the proxy
  const oracle = await ethers.getContractAt("OracleUpgradeable", proxyAddress);

  // Check if initialization worked
  const owner = await oracle.owner();
  console.log("Oracle owner:", owner);

  // Test creating a feed
  console.log("Testing Oracle functionality...");
  const tx = await oracle.createFeed("BTC", ethers.parseUnits("50000", 8));
  await tx.wait();

  const btcPrice = await oracle.getPrice("BTC");
  console.log("BTC price set to:", ethers.formatUnits(btcPrice, 8));

  console.log("Oracle deployment completed successfully!");
  console.log("Proxy address (use this for interactions):", proxyAddress);
  console.log("Implementation address:", implementationAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
