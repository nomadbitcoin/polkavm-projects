// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console2} from "forge-std/Test.sol";
import {CrudContract} from "../src/CrudContract.sol";

contract CrudContractTest is Test {
    CrudContract public crudContract;
    
    function setUp() public {
        crudContract = new CrudContract();
    }
    
    function test_CreateItem() public {
        string memory name = "Test Item";
        string memory description = "This is a test item";
        
        uint256 itemId = crudContract.createItem(name, description);
        
        assertEq(itemId, 0, "First item should have ID 0");
        
        CrudContract.Item memory item = crudContract.getItem(itemId);
        
        assertEq(item.id, itemId, "Item ID mismatch");
        assertEq(item.name, name, "Item name mismatch");
        assertEq(item.description, description, "Item description mismatch");
        assertTrue(item.isActive, "Item should be active");
    }
    
    function test_UpdateItem() public {
        // Create an item first
        uint256 itemId = crudContract.createItem("Original Name", "Original Description");
        
        // Update the item
        string memory newName = "Updated Name";
        string memory newDescription = "Updated Description";
        crudContract.updateItem(itemId, newName, newDescription);
        
        // Verify the update
        CrudContract.Item memory item = crudContract.getItem(itemId);
        
        assertEq(item.name, newName, "Item name was not updated");
        assertEq(item.description, newDescription, "Item description was not updated");
        assertTrue(item.isActive, "Item should still be active");
    }
    
    function test_DeleteItem() public {
        // Create an item first
        uint256 itemId = crudContract.createItem("Test Item", "Test Description");
        
        // Delete the item
        crudContract.deleteItem(itemId);
        
        // Verify the item is deleted
        assertFalse(crudContract.itemExists(itemId), "Item should be deleted");
        
        // Try to get the deleted item
        vm.expectRevert("Item does not exist or is deleted");
        crudContract.getItem(itemId);
    }
    
    function test_UpdateNonExistentItem() public {
        vm.expectRevert("Item does not exist or is deleted");
        crudContract.updateItem(999, "New Name", "New Description");
    }
    
    function test_DeleteNonExistentItem() public {
        vm.expectRevert("Item does not exist or is deleted");
        crudContract.deleteItem(999);
    }
    
    function test_MultipleItems() public {
        // Create multiple items
        uint256 itemId1 = crudContract.createItem("Item 1", "Description 1");
        uint256 itemId2 = crudContract.createItem("Item 2", "Description 2");
        uint256 itemId3 = crudContract.createItem("Item 3", "Description 3");
        
        // Verify IDs are sequential
        assertEq(itemId1, 0, "First item should have ID 0");
        assertEq(itemId2, 1, "Second item should have ID 1");
        assertEq(itemId3, 2, "Third item should have ID 2");
        
        // Verify all items exist
        assertTrue(crudContract.itemExists(itemId1), "Item 1 should exist");
        assertTrue(crudContract.itemExists(itemId2), "Item 2 should exist");
        assertTrue(crudContract.itemExists(itemId3), "Item 3 should exist");
        
        // Delete middle item
        crudContract.deleteItem(itemId2);
        
        // Verify only middle item is deleted
        assertTrue(crudContract.itemExists(itemId1), "Item 1 should still exist");
        assertFalse(crudContract.itemExists(itemId2), "Item 2 should be deleted");
        assertTrue(crudContract.itemExists(itemId3), "Item 3 should still exist");
    }
} 