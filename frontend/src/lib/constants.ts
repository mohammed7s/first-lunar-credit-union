// Contract addresses for Sepolia testnet
export const CONTRACTS = {
  // Sepolia USDC test token
  USDC: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238" as `0x${string}`,

  // Homan Bridge contracts (will be deployed later)
  // For now, we'll test with mock addresses
  PORTAL: "0x069840ae19473e452792c8e17fee77d78a3fcecb" as `0x${string}`,
  TOKEN: "0x93527f0552bef5fafc340bceac6a5a37b6c34496" as `0x${string}`,
  FEE_ASSET_HANDLER: "0x57860b112fc6890c4ddfeccb83714aa988dc382c" as `0x${string}`,
  SBT: "0x983ad7bdc7701a77a6c22e2245d7eafe893b21fe" as `0x${string}`,
};

export const USDC_DECIMALS = 6;

// Chain IDs
export const CHAIN_IDS = {
  MAINNET: 1,
  SEPOLIA: 11155111,
} as const;
