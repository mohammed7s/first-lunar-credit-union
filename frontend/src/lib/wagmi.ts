import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Get WalletConnect project ID from env
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// RPC URLs (optional - falls back to public RPCs if not provided)
const sepoliaRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL;
const mainnetRpcUrl = import.meta.env.VITE_MAINNET_RPC_URL;

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(), // MetaMask, Coinbase Wallet, etc.
    walletConnect({
      projectId,
      showQrModal: true,
    }),
  ],
  transports: {
    [mainnet.id]: http(mainnetRpcUrl),
    [sepolia.id]: http(sepoliaRpcUrl),
  },
});
