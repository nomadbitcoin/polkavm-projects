// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console2} from "forge-std/Script.sol";
import {OracleUpgradeable} from "../src/OracleUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract UpgradeOracle is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");
        
        console2.log("Upgrading Oracle at proxy address:", proxyAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the new implementation
        OracleUpgradeable newImplementation = new OracleUpgradeable();
        console2.log("New implementation deployed at:", address(newImplementation));
        
        // Upgrade the proxy
        UUPSUpgradeable proxy = UUPSUpgradeable(proxyAddress);
        proxy.upgradeToAndCall(address(newImplementation), "");
        console2.log("Upgrade completed successfully!");
        
        vm.stopBroadcast();
        
        console2.log("Oracle upgraded successfully!");
        console2.log("New implementation address:", address(newImplementation));
    }
} 