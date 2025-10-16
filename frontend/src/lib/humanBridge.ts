/**
 * Human Bridge Integration
 * Bridges assets between Ethereum L1 and Aztec L2
 * Documentation: https://docs.human.finance
 */

export const HUMAN_BRIDGE_CONFIG = {
  // Human Bridge widget URL
  widgetUrl: 'https://bridge.human.finance',

  // Supported tokens
  tokens: {
    USDC_ETHEREUM: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
    USDC_SEPOLIA: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
  },

  // Bridge types
  directions: {
    DEPOSIT: 'deposit', // Ethereum → Aztec
    WITHDRAW: 'withdraw', // Aztec → Ethereum
  }
};

export interface BridgeParams {
  direction: 'deposit' | 'withdraw';
  amount: string;
  token: string;
  fromAddress?: string;
  toAddress?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Opens the Human Bridge widget in a new window
 */
export const openHumanBridge = (params: BridgeParams) => {
  const {
    direction,
    amount,
    token,
    fromAddress,
    toAddress,
    onSuccess,
    onError
  } = params;

  // Build query parameters
  const queryParams = new URLSearchParams({
    direction,
    amount,
    token,
    ...(fromAddress && { from: fromAddress }),
    ...(toAddress && { to: toAddress }),
  });

  const bridgeUrl = `${HUMAN_BRIDGE_CONFIG.widgetUrl}?${queryParams.toString()}`;

  // Open bridge in popup window
  const width = 500;
  const height = 700;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  const bridgeWindow = window.open(
    bridgeUrl,
    'HumanBridge',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );

  if (!bridgeWindow) {
    onError?.(new Error('Failed to open bridge window. Please allow popups.'));
    return;
  }

  // Listen for messages from bridge window
  const handleMessage = (event: MessageEvent) => {
    // Verify origin for security
    if (event.origin !== new URL(HUMAN_BRIDGE_CONFIG.widgetUrl).origin) {
      return;
    }

    const { type, data } = event.data;

    switch (type) {
      case 'bridge_success':
        console.log('Bridge successful:', data);
        onSuccess?.();
        bridgeWindow.close();
        window.removeEventListener('message', handleMessage);
        break;

      case 'bridge_error':
        console.error('Bridge error:', data);
        onError?.(new Error(data.message || 'Bridge transaction failed'));
        window.removeEventListener('message', handleMessage);
        break;

      case 'bridge_cancelled':
        console.log('Bridge cancelled by user');
        bridgeWindow.close();
        window.removeEventListener('message', handleMessage);
        break;
    }
  };

  window.addEventListener('message', handleMessage);

  // Clean up listener if window is closed manually
  const checkClosed = setInterval(() => {
    if (bridgeWindow.closed) {
      clearInterval(checkClosed);
      window.removeEventListener('message', handleMessage);
    }
  }, 1000);

  return bridgeWindow;
};

/**
 * Deposits USDC from Ethereum to Aztec
 */
export const depositToAztec = async (
  amount: string,
  fromAddress: string,
  toAztecAddress: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  return openHumanBridge({
    direction: HUMAN_BRIDGE_CONFIG.directions.DEPOSIT,
    amount,
    token: HUMAN_BRIDGE_CONFIG.tokens.USDC_SEPOLIA, // Use Sepolia for testing
    fromAddress,
    toAddress: toAztecAddress,
    onSuccess,
    onError,
  });
};

/**
 * Withdraws USDC from Aztec to Ethereum
 */
export const withdrawToEthereum = async (
  amount: string,
  fromAztecAddress: string,
  toEthereumAddress: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  return openHumanBridge({
    direction: HUMAN_BRIDGE_CONFIG.directions.WITHDRAW,
    amount,
    token: HUMAN_BRIDGE_CONFIG.tokens.USDC_SEPOLIA, // Use Sepolia for testing
    fromAddress: fromAztecAddress,
    toAddress: toEthereumAddress,
    onSuccess,
    onError,
  });
};
