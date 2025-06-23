import { JsonRpcProvider } from "ethers";

// Westend Asset Hub RPC URL
const WESTEND_RPC_URL = "https://westend-asset-hub-eth-rpc.polkadot.io";

// Force to use Westend network - always use direct RPC connection
export const ethersProvider = new JsonRpcProvider(WESTEND_RPC_URL);
