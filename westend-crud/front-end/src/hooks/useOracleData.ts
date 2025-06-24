import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ethersProvider } from "../ethersProvider";
import OracleABI from "../Oracle.json";

// Use the complete ABI from Oracle.json
const ORACLE_ABI = OracleABI.abi;

export interface OraclePrice {
  symbol: string;
  price: string;
  lastUpdated: string;
  exists: boolean;
  isActive: boolean;
}

export function useOracleData(
  oracleAddress: string,
  symbols: string[] = ["BTC", "DOT", "ETH", "SOL", "USDT", "USDC"]
) {
  const [prices, setPrices] = useState<OraclePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOracleData() {
      // Early return if missing dependencies
      if (!ethersProvider || !oracleAddress) {
        setError(
          !ethersProvider
            ? "Provider not available"
            : "Oracle address not available"
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const oracleContract = new ethers.Contract(
          oracleAddress,
          ORACLE_ABI,
          ethersProvider
        );

        // Fetch all price data in parallel
        const priceData = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const exists = await oracleContract.feedExists(symbol);

              if (!exists) {
                return {
                  symbol,
                  price: "0",
                  lastUpdated: "N/A",
                  exists: false,
                  isActive: false,
                };
              }

              const [isActive, price, lastUpdated] = await Promise.all([
                oracleContract.isActive(symbol),
                oracleContract.getPrice(symbol),
                oracleContract.getLastUpdated(symbol),
              ]);

              return {
                symbol,
                price: ethers.formatUnits(price, 8),
                lastUpdated: new Date(
                  Number(lastUpdated) * 1000
                ).toLocaleString(),
                exists,
                isActive,
              };
            } catch {
              return {
                symbol,
                price: "0",
                lastUpdated: "N/A",
                exists: false,
                isActive: false,
              };
            }
          })
        );

        setPrices(priceData);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch oracle data"
        );
        setLoading(false);
      }
    }

    fetchOracleData();
    setLoading(false);

    // Poll every 30 seconds
    const interval = setInterval(fetchOracleData, 30000);
    return () => clearInterval(interval);
  }, [oracleAddress, symbols]);

  return { prices, loading, error };
}
