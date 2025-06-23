import { OraclePrice } from "../hooks/useOracleData";

interface OraclePriceCardProps {
  priceData: OraclePrice;
}

export function OraclePriceCard({ priceData }: OraclePriceCardProps) {
  const { symbol, price, lastUpdated, exists, isActive } = priceData;

  if (!exists || !isActive) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            {symbol}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Feed not available
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {symbol}
        </h3>
        <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
          Active
        </span>
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          $
          {parseFloat(price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Last updated: {lastUpdated}
      </div>
    </div>
  );
}
