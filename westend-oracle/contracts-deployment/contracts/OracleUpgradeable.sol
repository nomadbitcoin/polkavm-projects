// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract OracleUpgradeable is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    mapping(string => uint256) public prices;
    mapping(string => uint256) public lastUpdated;
    mapping(string => bool) public isActive;

    event PriceUpdated(string indexed symbol, uint256 price, uint256 timestamp);
    event FeedCreated(string indexed symbol, uint256 price);
    event FeedDeleted(string indexed symbol);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // CREATE - Create a new price feed
    function createFeed(string memory _symbol, uint256 _price) public onlyOwner {
        require(bytes(_symbol).length > 0, "Symbol cannot be empty");
        require(!isActive[_symbol], "Feed already exists");
        
        prices[_symbol] = _price;
        lastUpdated[_symbol] = block.timestamp;
        isActive[_symbol] = true;
        
        emit FeedCreated(_symbol, _price);
    }

    // READ - Get price by symbol
    function getPrice(string memory _symbol) public view returns (uint256) {
        require(isActive[_symbol], "Feed does not exist");
        return prices[_symbol];
    }

    // READ - Get last updated timestamp
    function getLastUpdated(string memory _symbol) public view returns (uint256) {
        require(isActive[_symbol], "Feed does not exist");
        return lastUpdated[_symbol];
    }

    // UPDATE - Update price
    function updatePrice(string memory _symbol, uint256 _price) public onlyOwner {
        require(isActive[_symbol], "Feed does not exist");
        
        prices[_symbol] = _price;
        lastUpdated[_symbol] = block.timestamp;
        
        emit PriceUpdated(_symbol, _price, block.timestamp);
    }

    // DELETE - Delete a feed
    function deleteFeed(string memory _symbol) public onlyOwner {
        require(isActive[_symbol], "Feed does not exist");
        
        isActive[_symbol] = false;
        
        emit FeedDeleted(_symbol);
    }

    // Check if feed exists
    function feedExists(string memory _symbol) public view returns (bool) {
        return isActive[_symbol];
    }

    // Version function for upgrade testing
    function version() public pure returns (string memory) {
        return "0.1.0";
    }
} 