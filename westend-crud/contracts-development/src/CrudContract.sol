// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CrudContract {
    struct Item {
        uint256 id;
        string name;
        string description;
        bool isActive;
    }

    // Mapping from item ID to Item
    mapping(uint256 => Item) private items;
    
    // Counter for generating unique IDs
    uint256 private nextItemId;
    
    // Events
    event ItemCreated(uint256 indexed id, string name, string description);
    event ItemUpdated(uint256 indexed id, string name, string description);
    event ItemDeleted(uint256 indexed id);
    
    // Create a new item
    function createItem(string memory _name, string memory _description) public returns (uint256) {
        uint256 itemId = nextItemId;
        items[itemId] = Item({
            id: itemId,
            name: _name,
            description: _description,
            isActive: true
        });
        nextItemId++;
        
        emit ItemCreated(itemId, _name, _description);
        return itemId;
    }
    
    // Read an item
    function getItem(uint256 _id) public view returns (Item memory) {
        require(items[_id].isActive, "Item does not exist or is deleted");
        return items[_id];
    }
    
    // Update an item
    function updateItem(uint256 _id, string memory _name, string memory _description) public {
        require(items[_id].isActive, "Item does not exist or is deleted");
        
        items[_id].name = _name;
        items[_id].description = _description;
        
        emit ItemUpdated(_id, _name, _description);
    }
    
    // Delete an item (soft delete)
    function deleteItem(uint256 _id) public {
        require(items[_id].isActive, "Item does not exist or is deleted");
        
        items[_id].isActive = false;
        
        emit ItemDeleted(_id);
    }
    
    // Check if an item exists
    function itemExists(uint256 _id) public view returns (bool) {
        return items[_id].isActive;
    }
} 