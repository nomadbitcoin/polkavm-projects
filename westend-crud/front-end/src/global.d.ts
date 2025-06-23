declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
    talismanEth?: import("ethers").Eip1193Provider;
    subwallet?: import("ethers").Eip1193Provider;
    injectedWeb3?: Record<string, unknown>;
  }
}
export default global;
