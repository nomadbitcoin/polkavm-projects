// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console2} from "forge-std/Test.sol";
import {OracleUpgradeable} from "../src/OracleUpgradeable.sol";
import {OracleProxy} from "../src/OracleProxy.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract OracleUpgradeabilityTest is Test {
    OracleUpgradeable public implementation;
    OracleProxy public proxy;
    OracleUpgradeable public oracle;
    address public owner;
    address public user;
    
    function setUp() public {
        owner = address(this);
        user = address(0x123);
        
        // Deploy implementation
        implementation = new OracleUpgradeable();
        
        // Prepare initialization data
        bytes memory initData = abi.encodeWithSelector(
            OracleUpgradeable.initialize.selector,
            owner
        );
        
        // Deploy proxy
        proxy = new OracleProxy(address(implementation), initData);
        
        // Cast proxy to OracleUpgradeable interface
        oracle = OracleUpgradeable(address(proxy));
    }
    
    function test_Upgrade() public {
        // Create some data before upgrade
        oracle.createFeed("BTC", 50000 * 10**8);
        oracle.createFeed("ETH", 3000 * 10**8);
        
        // Deploy new implementation
        OracleUpgradeable newImplementation = new OracleUpgradeable();
        
        // Upgrade the proxy
        UUPSUpgradeable(address(proxy)).upgradeToAndCall(address(newImplementation), "");
        
        // Verify data is preserved
        assertEq(oracle.prices("BTC"), 50000 * 10**8, "BTC price should be preserved");
        assertEq(oracle.prices("ETH"), 3000 * 10**8, "ETH price should be preserved");
        assertTrue(oracle.feedExists("BTC"), "BTC feed should still exist");
        assertTrue(oracle.feedExists("ETH"), "ETH feed should still exist");
        
        // Verify we can still use the contract
        oracle.updatePrice("BTC", 60000 * 10**8);
        assertEq(oracle.getPrice("BTC"), 60000 * 10**8, "Should be able to update price after upgrade");
        
        oracle.createFeed("SOL", 100 * 10**8);
        assertTrue(oracle.feedExists("SOL"), "Should be able to create new feed after upgrade");
    }
    
    function test_Upgrade_OnlyOwner() public {
        // Deploy new implementation
        OracleUpgradeable newImplementation = new OracleUpgradeable();
        
        // Try to upgrade as non-owner
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("OwnableUnauthorizedAccount(address)")), user));
        UUPSUpgradeable(address(proxy)).upgradeToAndCall(address(newImplementation), "");
    }
    
    function test_Upgrade_InvalidImplementation() public {
        // Try to upgrade to an invalid implementation (address(0))
        vm.expectRevert();
        UUPSUpgradeable(address(proxy)).upgradeToAndCall(address(0), "");
    }
    
    function test_Upgrade_DataPreservation() public {
        // Create feeds with different data types
        oracle.createFeed("BTC", 50000 * 10**8);
        oracle.createFeed("ETH", 3000 * 10**8);
        oracle.createFeed("SOL", 100 * 10**8);
        
        // Update some prices
        oracle.updatePrice("ETH", 3500 * 10**8);
        oracle.updatePrice("SOL", 150 * 10**8);
        
        // Delete one feed
        oracle.deleteFeed("SOL");
        
        // Deploy new implementation
        OracleUpgradeable newImplementation = new OracleUpgradeable();
        
        // Upgrade
        UUPSUpgradeable(address(proxy)).upgradeToAndCall(address(newImplementation), "");
        
        // Verify all data is preserved
        assertEq(oracle.prices("BTC"), 50000 * 10**8, "BTC price should be preserved");
        assertEq(oracle.prices("ETH"), 3500 * 10**8, "ETH updated price should be preserved");
        assertTrue(oracle.isActive("BTC"), "BTC active status should be preserved");
        assertTrue(oracle.isActive("ETH"), "ETH active status should be preserved");
        assertFalse(oracle.isActive("SOL"), "SOL inactive status should be preserved");
        assertFalse(oracle.feedExists("SOL"), "SOL deleted status should be preserved");
    }
} 