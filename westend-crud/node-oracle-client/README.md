# Oracle Price Feed Cloud Function

This cloud function automatically updates price feeds on the Polkadot Westend network by fetching real-time cryptocurrency prices from CoinGecko API.

## Features

- 🕐 Runs hourly to update price feeds
- 📊 Fetches prices from CoinGecko API
- 🔗 Updates Oracle smart contract on Westend network
- 🛡️ Handles both new feed creation and price updates
- ⚡ Includes rate limiting and error handling

## Supported Cryptocurrencies

The function tracks the following cryptocurrencies:

- Bitcoin (BTC)
- Polkadot (DOT)
- Ethereum (ETH)
- Solana (SOL)
- Tether (USDT)
- USD Coin (USDC)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Westend Network Configuration
WESTEND_HUB_PK=your_private_key_here
WESTEND_ORACLE_MODULE=your_oracle_contract_address_here
```

### 3. Deploy Oracle Contract

Make sure your Oracle contract is deployed on the Westend network and update the `WESTEND_ORACLE_MODULE` address in your `.env` file.

## Usage

### Local Testing

Run the function locally to test:

```bash
npm start
```

### Cloud Deployment

This function is designed to be deployed as a cloud function that runs hourly. You can deploy it to:

- **Google Cloud Functions**
- **AWS Lambda**
- **Azure Functions**
- **Vercel Functions**

### Example Cloud Function Deployment

#### Google Cloud Functions

1. Build the project:

```bash
npm run build
```

2. Deploy to Google Cloud Functions:

```bash
gcloud functions deploy update-price-feeds \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point updatePriceFeeds \
  --source . \
  --allow-unauthenticated
```

#### AWS Lambda

1. Create a deployment package:

```bash
npm run build
zip -r function.zip dist/ node_modules/ package.json
```

2. Upload to AWS Lambda and configure with hourly CloudWatch Events trigger.

## Configuration

### Network Settings

- **RPC URL**: `https://westend-asset-hub-eth-rpc.polkadot.io`
- **Network**: Polkadot Westend Asset Hub
- **Gas Limit**: 200,000 per transaction

### Price Precision

Prices are stored with 8 decimal places precision, allowing for prices up to $0.00000001.

### Rate Limiting

- 2-second delay between transactions
- 10-second timeout for CoinGecko API calls
- Automatic retry logic for failed transactions

## Monitoring

The function provides detailed logging:

- ✅ Successful price updates
- ⚠️ Missing price data warnings
- ❌ Error details for failed transactions
- 📊 Transaction hashes for verification

## Error Handling

The function handles various error scenarios:

- Network connectivity issues
- API rate limiting
- Invalid contract addresses
- Insufficient gas
- Transaction failures

## Security

- Private keys are stored securely in environment variables
- No sensitive data is logged
- HTTPS-only API calls
- Input validation for all parameters

## Development

### Adding New Cryptocurrencies

To add new cryptocurrencies, update the `SYMBOLS` array in `src/cloud-function.ts`:

```typescript
const SYMBOLS = [
  "bitcoin",
  "polkadot",
  "ethereum",
  "solana",
  "tether",
  "usd-coin",
  // Add new symbols here
  "new-cryptocurrency",
];
```

### Modifying Update Frequency

Change the cloud function trigger to run at different intervals:

- **Every 15 minutes**: `*/15 * * * *`
- **Every hour**: `0 * * * *`
- **Every 6 hours**: `0 */6 * * *`

## Troubleshooting

### Common Issues

1. **"WESTEND_HUB_PK environment variable is required"**

   - Ensure your `.env` file is properly configured
   - Check that the private key is valid

2. **"WESTEND_ORACLE_MODULE environment variable is required"**

   - Verify the Oracle contract address is correct
   - Ensure the contract is deployed on Westend network

3. **"Error fetching prices from CoinGecko"**

   - Check internet connectivity
   - Verify CoinGecko API is accessible
   - Check for rate limiting

4. **Transaction failures**
   - Ensure sufficient balance for gas fees
   - Verify the wallet has permission to update the oracle
   - Check network connectivity

### Logs

Monitor the function logs to identify issues:

```bash
# For local testing
npm start

# For cloud deployments, check your cloud provider's logging
```

## License

ISC
