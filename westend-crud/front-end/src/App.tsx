import { ethersProvider } from "./ethersProvider";
import { OraclePriceDashboard } from "./components/OraclePriceDashboard";
import "./App.css";

import polkadotLogo from "./assets/polkadot-logo.svg";

// Get Oracle contract address from environment variable
const ORACLE_CONTRACT_ADDRESS =
  process.env.WESTEND_ORACLE_MODULE || "YOUR_ORACLE_CONTRACT_ADDRESS_HERE";

function App() {
  return (
    <>
      <img
        src={polkadotLogo}
        className="mx-auto h-52 p-4 logo"
        alt="Polkadot logo"
      />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Oracle Price Dashboard
        </h1>

        {ethersProvider ? (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-auto mr-auto">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 text-center">
                    Provider Connected
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 text-center">
                    Successfully connected to the network. Oracle data will be
                    fetched automatically.
                  </div>
                </div>
              </div>
            </div>

            {ORACLE_CONTRACT_ADDRESS === "YOUR_ORACLE_CONTRACT_ADDRESS_HERE" ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Configuration Required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      Please set the{" "}
                      <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">
                        WESTEND_ORACLE_MODULE
                      </code>{" "}
                      environment variable with your deployed Oracle contract
                      address.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <OraclePriceDashboard oracleAddress={ORACLE_CONTRACT_ADDRESS} />
            )}
          </div>
        ) : (
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
                  Provider Not Available
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  Unable to connect to the network. Please check your
                  connection.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
