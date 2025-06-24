// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console2} from "forge-std/Test.sol";
import {OracleUpgradeable} from "../src/OracleUpgradeable.sol";
import {OracleProxy} from "../src/OracleProxy.sol";

contract OracleBasicTest is Test {
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
    
    function test_Initialization() public view {
        assertEq(oracle.owner(), owner, "Owner should be set correctly");
        assertEq(oracle.version(), "0.1.0", "Version should be correct");
    }
    
    function test_CreateFeed() public {
        string memory symbol = "BTC";
        uint256 price = 50000 * 10**8; // $50,000 with 8 decimals
        
        oracle.createFeed(symbol, price);
        
        assertEq(oracle.prices(symbol), price, "Price should match");
        assertTrue(oracle.isActive(symbol), "Feed should be active");
        assertTrue(oracle.feedExists(symbol), "Feed should exist");
    }
    
    function test_CreateFeed_EmptySymbol() public {
        vm.expectRevert("Symbol cannot be empty");
        oracle.createFeed("", 1000);
    }
    
    function test_CreateFeed_DuplicateSymbol() public {
        oracle.createFeed("ETH", 3000);
        
        vm.expectRevert("Feed already exists");
        oracle.createFeed("ETH", 4000);
    }
    
    function test_GetPrice() public {
        string memory symbol = "ETH";
        uint256 price = 3000 * 10**8;
        
        oracle.createFeed(symbol, price);
        
        uint256 retrievedPrice = oracle.getPrice(symbol);
        assertEq(retrievedPrice, price, "Retrieved price should match");
    }
    
    function test_GetPrice_NonExistentFeed() public {
        vm.expectRevert("Feed does not exist");
        oracle.getPrice("NONEXISTENT");
    }
    
    function test_GetPrice_DeletedFeed() public {
        oracle.createFeed("SOL", 100);
        oracle.deleteFeed("SOL");
        
        vm.expectRevert("Feed does not exist");
        oracle.getPrice("SOL");
    }
    
    function test_GetLastUpdated() public {
        string memory symbol = "ADA";
        uint256 price = 0.5 * 10**8;
        
        oracle.createFeed(symbol, price);
        
        uint256 lastUpdated = oracle.getLastUpdated(symbol);
        assertEq(lastUpdated, block.timestamp, "Last updated should match current timestamp");
    }
    
    function test_GetLastUpdated_NonExistentFeed() public {
        vm.expectRevert("Feed does not exist");
        oracle.getLastUpdated("NONEXISTENT");
    }
    
    function test_UpdatePrice() public {
        string memory symbol = "DOT";
        uint256 initialPrice = 10 * 10**8;
        uint256 newPrice = 12 * 10**8;
        
        oracle.createFeed(symbol, initialPrice);
        
        // Warp time to simulate time passing
        vm.warp(block.timestamp + 3600); // 1 hour later
        
        oracle.updatePrice(symbol, newPrice);
        
        assertEq(oracle.prices(symbol), newPrice, "Price should be updated");
        assertEq(oracle.getLastUpdated(symbol), block.timestamp, "Last updated should be updated");
    }
    
    function test_UpdatePrice_NonExistentFeed() public {
        vm.expectRevert("Feed does not exist");
        oracle.updatePrice("NONEXISTENT", 1000);
    }
    
    function test_UpdatePrice_DeletedFeed() public {
        oracle.createFeed("LINK", 20);
        oracle.deleteFeed("LINK");
        
        vm.expectRevert("Feed does not exist");
        oracle.updatePrice("LINK", 25);
    }
    
    function test_DeleteFeed() public {
        string memory symbol = "MATIC";
        uint256 price = 1 * 10**8;
        
        oracle.createFeed(symbol, price);
        assertTrue(oracle.feedExists(symbol), "Feed should exist before deletion");
        
        oracle.deleteFeed(symbol);
        
        assertFalse(oracle.feedExists(symbol), "Feed should not exist after deletion");
        assertFalse(oracle.isActive(symbol), "Feed should not be active after deletion");
    }
    
    function test_DeleteFeed_NonExistentFeed() public {
        vm.expectRevert("Feed does not exist");
        oracle.deleteFeed("NONEXISTENT");
    }
    
    function test_DeleteFeed_AlreadyDeleted() public {
        oracle.createFeed("AVAX", 30);
        oracle.deleteFeed("AVAX");
        
        vm.expectRevert("Feed does not exist");
        oracle.deleteFeed("AVAX");
    }
    
    function test_FeedExists() public {
        string memory symbol = "UNI";
        
        assertFalse(oracle.feedExists(symbol), "Feed should not exist initially");
        
        oracle.createFeed(symbol, 5 * 10**8);
        assertTrue(oracle.feedExists(symbol), "Feed should exist after creation");
        
        oracle.deleteFeed(symbol);
        assertFalse(oracle.feedExists(symbol), "Feed should not exist after deletion");
    }
    
    function test_MultipleFeeds() public {
        // Create multiple feeds
        oracle.createFeed("BTC", 50000 * 10**8);
        oracle.createFeed("ETH", 3000 * 10**8);
        oracle.createFeed("SOL", 100 * 10**8);
        
        // Verify all feeds exist
        assertTrue(oracle.feedExists("BTC"), "BTC feed should exist");
        assertTrue(oracle.feedExists("ETH"), "ETH feed should exist");
        assertTrue(oracle.feedExists("SOL"), "SOL feed should exist");
        
        // Update one feed
        oracle.updatePrice("ETH", 3500 * 10**8);
        assertEq(oracle.getPrice("ETH"), 3500 * 10**8, "ETH price should be updated");
        
        // Delete one feed
        oracle.deleteFeed("SOL");
        assertFalse(oracle.feedExists("SOL"), "SOL feed should be deleted");
        assertTrue(oracle.feedExists("BTC"), "BTC feed should still exist");
        assertTrue(oracle.feedExists("ETH"), "ETH feed should still exist");
    }
    
    function test_OnlyOwnerAccess() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("OwnableUnauthorizedAccount(address)")), user));
        oracle.createFeed("TEST", 1000);
        
        oracle.createFeed("TEST", 1000);
        
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("OwnableUnauthorizedAccount(address)")), user));
        oracle.updatePrice("TEST", 2000);
        
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("OwnableUnauthorizedAccount(address)")), user));
        oracle.deleteFeed("TEST");
    }
    
    function test_Events() public {
        string memory symbol = "XRP";
        uint256 price = 0.5 * 10**8;
        
        // Test FeedCreated event
        vm.expectEmit(true, false, false, true);
        emit OracleUpgradeable.FeedCreated(symbol, price);
        oracle.createFeed(symbol, price);
        
        // Test PriceUpdated event
        uint256 newPrice = 0.6 * 10**8;
        vm.expectEmit(true, false, false, true);
        emit OracleUpgradeable.PriceUpdated(symbol, newPrice, block.timestamp);
        oracle.updatePrice(symbol, newPrice);
        
        // Test FeedDeleted event
        vm.expectEmit(true, false, false, true);
        emit OracleUpgradeable.FeedDeleted(symbol);
        oracle.deleteFeed(symbol);
    }
    
    function test_PublicMappings() public {
        string memory symbol = "DOGE";
        uint256 price = 0.1 * 10**8;
        
        oracle.createFeed(symbol, price);
        
        // Test direct mapping access
        assertEq(oracle.prices(symbol), price, "Direct mapping access should work");
        assertEq(oracle.lastUpdated(symbol), block.timestamp, "Direct mapping access should work");
        assertTrue(oracle.isActive(symbol), "Direct mapping access should work");
    }
} 