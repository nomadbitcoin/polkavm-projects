# Westend Oracle Smart Contract Project

## Overview

This project demonstrates Oracle functionality with full CRUD (Create, Read, Update, Delete) operations for price feeds using smart contracts on the Westend testnet.

The Oracle contract provides a simple and efficient way to manage price feeds for various assets (cryptocurrencies, tokens, etc.) with comprehensive access control and event logging.

## Development Stack

- **Smart Contract Development**: Foundry
- **Testing**: Foundry's testing framework
- **Deployment**: Hardhat with Polkavm integration

## Why This Stack?

While `polkadot-foundry` is a promising tool, its current version has limitations with Anvil commands like `forge test` and `forge script`. Therefore, we're using:

1. Original Foundry project for smart contract development and testing
2. Hardhat with Polkavm specifics for deployment

This combination allows us to leverage the powerful development and testing capabilities of Foundry while maintaining compatibility with Polkavm deployment requirements.

## Oracle Contract Features

- **CREATE**: Add new price feeds with symbol and price
- **READ**: Retrieve current prices and last update timestamps
- **UPDATE**: Update prices for existing feeds
- **DELETE**: Soft delete feeds (maintains data integrity)
- **Access Control**: Only owner can modify feeds
- **Event Logging**: Comprehensive event tracking for all operations

## Project Structure

```
westend-crud/
├── contracts-development/     # Foundry project for development & testing
│   ├── src/
│   │   └── Oracle.sol         # Main Oracle contract
│   ├── test/
│   │   └── Oracle.t.sol       # Comprehensive test suite
│   └── README.md              # Development documentation
└── contracts-deployment/      # Hardhat project for deployment
    ├── contracts/
    ├── scripts/
    └── hardhat.config.ts
```
