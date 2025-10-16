import { AztecWalletSdk, obsidion } from "@nemi-fi/wallet-sdk";
import { createAztecNodeClient, createPXEClient } from "@aztec/aztec.js";

// Testnet configuration - using the same URL as Homan bridge
const AZTEC_NODE_URL = "https://aztec-alpha-testnet-fullnode.zkv.xyz/";

// Create Aztec node and PXE clients
export const aztecNode = createAztecNodeClient(AZTEC_NODE_URL);
export const pxe = createPXEClient(AZTEC_NODE_URL);

// SDK instance - must be created outside React components
export const aztecSdk = new AztecWalletSdk({
  aztecNode: AZTEC_NODE_URL,
  connectors: [obsidion({})],
});

// Function to connect to the specified wallet type
export const connectWallet = async (type: 'obsidion') => {
  try {
    await aztecSdk.connect(type);
    return await aztecSdk.getAccount();
  } catch (error) {
    console.error(`Failed to connect to ${type} wallet:`, error);
    throw error;
  }
};

// Aztec USDC token address (you'll provide this)
export const AZTEC_USDC_ADDRESS = import.meta.env.VITE_AZTEC_USDC_ADDRESS || "";
