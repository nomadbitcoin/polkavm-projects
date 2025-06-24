import { useOracleData } from "../hooks/useOracleData";
import { OraclePriceCard } from "./OraclePriceCard";

interface OraclePriceDashboardProps {
  oracleAddress: string;
}

export function OraclePriceDashboard({
  oracleAddress,
}: OraclePriceDashboardProps) {
  const { prices, loading, error } = useOracleData(oracleAddress);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Loading oracle data...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error loading oracle data
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeFeeds = prices.filter((price) => price.exists && price.isActive);
  const inactiveFeeds = prices.filter(
    (price) => !price.exists || !price.isActive
  );

  // Function to get optimal grid columns based on number of items
  const getGridColumns = (itemCount: number) => {
    if (itemCount <= 2) return "grid-cols-1 sm:grid-cols-2";
    if (itemCount <= 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    if (itemCount <= 6)
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6";
    if (itemCount <= 8)
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";
  };

  return (
    <div className="space-y-6">
      {/* Active Feeds */}
      {activeFeeds.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Active Price Feeds ({activeFeeds.length})
          </h2>
          <div className={`grid ${getGridColumns(activeFeeds.length)} gap-4`}>
            {activeFeeds.map((priceData) => (
              <OraclePriceCard key={priceData.symbol} priceData={priceData} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Feeds */}
      {inactiveFeeds.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Inactive Feeds ({inactiveFeeds.length})
          </h2>
          <div className={`grid ${getGridColumns(inactiveFeeds.length)} gap-4`}>
            {inactiveFeeds.map((priceData) => (
              <OraclePriceCard key={priceData.symbol} priceData={priceData} />
            ))}
          </div>
        </div>
      )}

      {/* No feeds available */}
      {prices.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            No price feeds available. Please check the oracle contract
            configuration.
          </div>
        </div>
      )}
    </div>
  );
}
