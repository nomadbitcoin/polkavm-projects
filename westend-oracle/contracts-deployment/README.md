# Oracle Deployment

Deployment scripts for the upgradeable Oracle smart contract on Westend Asset Hub.

## Deployed Contracts

**Current Deployment:**

- **Proxy Address**: `0xA26313ACf84ff7C6d471BAE69f96A84E3036F9e4`
- **Implementation Address**: `0x0b74B3D148222081c0F0E071f8140E76eD6bF1F0`

> **Note**: Always use the proxy address for interactions. The implementation address is only needed for upgrades.

## Quick Start

### Deploy Oracle

```bash
npx hardhat run scripts/deploy-oracle.ts --network westendAssetHub
```

### Upgrade Oracle

```bash
PROXY_ADDRESS=0xA26313ACf84ff7C6d471BAE69f96A84E3036F9e4 npx hardhat run scripts/upgrade-oracle.ts --network westendAssetHub
```

### Test Oracle

```bash
npx hardhat run scripts/connect-oracle.ts --network westendAssetHub
```

## Environment Setup

Create `.env` file:

```env
WESTEND_HUB_PK=your_private_key_here
WESTEND_ORACLE_MODULE=0xA26313ACf84ff7C6d471BAE69f96A84E3036F9e4
```

## Scripts

| Script              | Purpose                       | Usage                                                                                     |
| ------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| `deploy-oracle.ts`  | Deploy Oracle with UUPS proxy | `npx hardhat run scripts/deploy-oracle.ts --network westendAssetHub`                      |
| `upgrade-oracle.ts` | Upgrade Oracle implementation | `PROXY_ADDRESS=0x... npx hardhat run scripts/upgrade-oracle.ts --network westendAssetHub` |
| `connect-oracle.ts` | Test Oracle functionality     | `npx hardhat run scripts/connect-oracle.ts --network westendAssetHub`                     |

## Contract Architecture

**UUPS Proxy Pattern:**

- `OracleUpgradeable`: Implementation contract with business logic
- `OracleProxy`: Proxy contract that delegates calls to implementation
- Storage: All data stored in proxy, preserved during upgrades

## Oracle Functions

| Function                     | Description               |
| ---------------------------- | ------------------------- |
| `createFeed(symbol, price)`  | Create new price feed     |
| `getPrice(symbol)`           | Get current price         |
| `updatePrice(symbol, price)` | Update existing price     |
| `deleteFeed(symbol)`         | Remove price feed         |
| `feedExists(symbol)`         | Check if feed exists      |
| `getLastUpdated(symbol)`     | Get last update timestamp |

## Network Configuration

```typescript
westendAssetHub: {
  polkavm: true,
  url: "https://westend-asset-hub-eth-rpc.polkadot.io",
  accounts: [process.env.WESTEND_HUB_PK || ""],
}
```
