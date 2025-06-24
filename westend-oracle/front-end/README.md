# Oracle Price Dashboard Frontend

A React-based frontend application for displaying real-time oracle prices from the deployed Oracle smart contract on Westend.

## Features

- 🪙 Real-time price feeds from Oracle contract
- 🔄 Automatic data refresh every 30 seconds
- 📱 Responsive design with Tailwind CSS
- 🌙 Dark mode support
- 💼 Multi-wallet support (MetaMask, Talisman, SubWallet)
- 📊 Visual price cards with status indicators

## Prerequisites

- Node.js (v16 or higher)
- A compatible wallet extension (MetaMask, Talisman, or SubWallet)
- Deployed Oracle contract on Westend network

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Oracle Contract Address:**

   - Open `src/App.tsx`
   - Replace `YOUR_ORACLE_CONTRACT_ADDRESS_HERE` with your deployed Oracle contract address
   - Example: `const ORACLE_CONTRACT_ADDRESS = "0x1234567890abcdef...";`

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:5173`
   - Connect your wallet to view oracle prices

## Oracle Contract Integration

This frontend connects to the Oracle smart contract with the following interface:

```solidity
// Key functions used by the frontend
function getPrice(string memory _symbol) public view returns (uint256)
function getLastUpdated(string memory _symbol) public view returns (uint256)
function feedExists(string memory _symbol) public view returns (bool)
function isActive(string memory _symbol) public view returns (bool)
```

## Supported Price Feeds

The dashboard automatically fetches prices for the following symbols:

- BTC (Bitcoin)
- ETH (Ethereum)
- SOL (Solana)
- ADA (Cardano)

You can modify the symbols array in `src/hooks/useOracleData.ts` to add or remove price feeds.

## Wallet Support

The application supports the following wallet providers:

- **MetaMask**: Standard Ethereum wallet
- **Talisman**: Polkadot ecosystem wallet
- **SubWallet**: Multi-chain wallet

## Development

### Project Structure

```
src/
├── components/
│   ├── OraclePriceCard.tsx      # Individual price card component
│   └── OraclePriceDashboard.tsx # Main dashboard component
├── hooks/
│   └── useOracleData.ts         # Custom hook for oracle data
├── assets/
│   └── polkadot-logo.svg        # Polkadot logo
├── App.tsx                      # Main application component
├── main.tsx                     # React entry point
└── index.css                    # Global styles
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Configuration

### Environment Variables

You can set the Oracle contract address via environment variable:

```bash
# Create a .env file
VITE_ORACLE_CONTRACT_ADDRESS=0x1234567890abcdef...
```

Then update `src/App.tsx`:

```typescript
const ORACLE_CONTRACT_ADDRESS =
  import.meta.env.VITE_ORACLE_CONTRACT_ADDRESS ||
  "YOUR_ORACLE_CONTRACT_ADDRESS_HERE";
```

### Customizing Price Feeds

To add or remove price feeds, edit the `symbols` parameter in `useOracleData`:

```typescript
// In src/hooks/useOracleData.ts
export function useOracleData(
  oracleAddress: string,
  symbols: string[] = ["BTC", "ETH", "SOL", "ADA", "DOT"]
) {
  // ... rest of the hook
}
```

## Troubleshooting

### Common Issues

1. **"Wallet Not Connected" Error**

   - Ensure you have a compatible wallet extension installed
   - Make sure the wallet is connected to the Westend network

2. **"Oracle Contract Address Not Configured"**

   - Update the `ORACLE_CONTRACT_ADDRESS` in `src/App.tsx`
   - Verify the contract address is correct

3. **"No Price Feeds Available"**

   - Check if the Oracle contract has active price feeds
   - Verify the contract is deployed and accessible

4. **Network Connection Issues**
   - Ensure you're connected to the correct network (Westend)
   - Check your RPC endpoint configuration

### Debug Mode

Enable debug logging by adding this to the browser console:

```javascript
localStorage.setItem("debug", "oracle:*");
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
