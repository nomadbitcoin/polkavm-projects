# Westend CRUD Smart Contract Project

## Overview

This project demonstrates CRUD (Create, Read, Update, Delete) operations using smart contracts on the Westend testnet.

## Development Stack

- **Smart Contract Development**: Foundry
- **Testing**: Foundry's testing framework
- **Deployment**: Hardhat with Polkavm integration

## Why This Stack?

While `polkadot-foundry` is a promising tool, its current version has limitations with Anvil commands like `forge test` and `forge script`. Therefore, we're using:

1. Original Foundry project for smart contract development and testing
2. Hardhat with Polkavm specifics for deployment

This combination allows us to leverage the powerful development and testing capabilities of Foundry while maintaining compatibility with Polkavm deployment requirements.
