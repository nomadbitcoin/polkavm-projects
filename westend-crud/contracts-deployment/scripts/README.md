# Oracle Scripts

This directory contains scripts for deploying and interacting with the Oracle smart contract on the Westend network.

## Deployment

### Oracle Contract Deployment with Ignition

Deploy the Oracle contract using Hardhat Ignition:

```bash
npx hardhat ignition deploy ignition/modules/Oracle.ts --network westendAssetHub
```

**Requirements:**

- `WESTEND_HUB_PK` environment variable set with your private key

## Scripts

### 1. `connect-oracle.ts`

Connects to an already deployed Oracle contract and runs comprehensive functionality tests.

**Usage:**

```bash
npx hardhat run scripts/connect-oracle.ts --network westendAssetHub
```

**Requirements:**

- `WESTEND_ORACLE_MODULE` environment variable set with the deployed contract address
- `WESTEND_HUB_PK` environment variable set with your private key

## Environment Variables

Create a `.env` file in the `contracts-deployment` directory with the following variables:

```env
# Your private key for Westend Asset Hub
WESTEND_HUB_PK=your_private_key_here

# Oracle contract address (after deployment)
WESTEND_ORACLE_MODULE=0x...your_deployed_contract_address_here
```

## Functionality Tests

The `connect-oracle.ts` script performs the following tests:

1. **Connection Verification** - Verifies the contract is accessible
2. **Feed Creation** - Creates BTC, ETH, SOL, and ADA price feeds
3. **Price Retrieval** - Gets current prices for all feeds
4. **Price Updates** - Updates prices for all feeds
5. **Feed Existence Check** - Verifies feed existence
6. **Error Handling** - Tests non-existent feed scenarios

## Network Configuration

The scripts are configured to work with the Westend Asset Hub network. Make sure your `hardhat.config.ts` includes the correct network configuration:

```typescript
westendAssetHub: {
  polkavm: true,
  url: "https://westend-asset-hub-eth-rpc.polkadot.io",
  accounts: [process.env.WESTEND_HUB_PK || ""],
}
```

## Error Handling

The connection script includes the following error handling:

- Contract connection failures
- Transaction failures
- Feed already exists scenarios
- Invalid feed queries
