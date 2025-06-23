# Westend Oracle Smart Contract Project

## Overview

This project demonstrates Oracle functionality with full CRUD (Create, Read, Update, Delete) operations for price feeds using smart contracts on the Westend test net. The project includes a complete full-stack application with smart contracts, a React frontend dashboard, and a Node.js oracle client.

The Oracle contract provides a simple and efficient way to manage price feeds for various assets (cryptocurrencies, tokens, etc.) with comprehensive access control and event logging. The frontend provides a real-time dashboard for viewing oracle prices, while the node client can be used for automated price updates.

## Development Stack

- **Smart Contract Development**: Foundry
- **Testing**: Foundry's testing framework
- **Deployment**: Hardhat with Polkavm integration
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Oracle Client**: Node.js + TypeScript + Ethers.js
- **Wallet Integration**: MetaMask, Talisman, SubWallet support

## Why This Stack?

While `polkadot-foundry` is a promising tool, its current version has limitations with Anvil commands like `forge test` and `forge script`. Therefore, we're using:

1. Original Foundry project for smart contract development and testing
2. Hardhat with Polkavm specifics for deployment
3. React frontend for user interface and real-time price monitoring
4. Node.js client for automated oracle operations

This combination allows us to leverage the powerful development and testing capabilities of Foundry while maintaining compatibility with Polkavm deployment requirements and providing a complete user experience.

## Oracle Contract Features

- **CREATE**: Add new price feeds with symbol and price
- **READ**: Retrieve current prices and last update timestamps
- **UPDATE**: Update prices for existing feeds
- **DELETE**: Soft delete feeds (maintains data integrity)
- **Access Control**: Only owner can modify feeds
- **Event Logging**: Comprehensive event tracking for all operations

## Frontend Features

- 🪙 Real-time price feeds from Oracle contract
- 🔄 Automatic data refresh every 30 seconds
- 📱 Responsive design with Tailwind CSS
- 🌙 Dark mode support
- 💼 Multi-wallet support (MetaMask, Talisman, SubWallet)
- 📊 Visual price cards with status indicators

## Project Structure

```
westend-crud/
├── contracts-development/     # Foundry project for development & testing
│   ├── src/
│   │   └── Oracle.sol         # Main Oracle contract
│   ├── test/
│   │   └── Oracle.t.sol       # Comprehensive test suite
│   └── README.md              # Development documentation
├── contracts-deployment/      # Hardhat project for deployment
│   ├── contracts/
│   ├── scripts/
│   └── hardhat.config.ts
├── front-end/                 # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/            # Custom React hooks
│   │   └── App.tsx           # Main application
│   ├── package.json          # Frontend dependencies
│   └── README.md             # Frontend documentation
├── node-oracle-client/        # Node.js oracle client
│   ├── src/                  # TypeScript source code
│   └── package.json          # Client dependencies
└── README.md                 # This file
```

## Quick Start

### 1. Smart Contract Development

```bash
cd contracts-development
forge install
forge test
```

### 2. Deploy Contracts

```bash
cd contracts-deployment
npm install
npx hardhat deploy --network westend
```

### 3. Start Frontend

```bash
cd front-end
npm install
# Update Oracle contract address in src/App.tsx
npm run dev
```

### 4. Run Oracle Client (Optional)

```bash
cd node-oracle-client
npm install
# Configure and run oracle client scripts
```

## Supported Price Feeds

The system supports various cryptocurrency price feeds including:

- BTC (Bitcoin)
- ETH (Ethereum)
- SOL (Solana)
- ADA (Cardano)
- DOT (Polkadot)

## Wallet Support

The frontend application supports multiple wallet providers:

- **MetaMask**: Standard Ethereum wallet
- **Talisman**: Polkadot ecosystem wallet
- **SubWallet**: Multi-chain wallet

## Documentation

- [Architecture Overview](ARCHITECTURE.md) - Detailed system architecture
- [Frontend Documentation](front-end/README.md) - Complete frontend setup and usage
- [Development Documentation](contracts-development/README.md) - Smart contract development guide
