import { useReadContract, useAccount } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { CONTRACTS, USDC_DECIMALS } from "@/lib/constants";

/**
 * Hook to read USDC balance from Ethereum L1
 * @param address - Optional address to check balance for (defaults to connected wallet)
 */
export const useUSDCBalance = (address?: `0x${string}`) => {
  const { address: connectedAddress } = useAccount();
  const addressToCheck = address || connectedAddress;

  const {
    data: balance,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACTS.USDC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: addressToCheck ? [addressToCheck] : undefined,
    query: {
      enabled: !!addressToCheck,
    },
  });

  const formattedBalance = balance
    ? formatUnits(balance, USDC_DECIMALS)
    : "0";

  const balanceNumber = parseFloat(formattedBalance);

  return {
    balance: balance || 0n,
    formattedBalance,
    balanceNumber,
    isLoading,
    isError,
    refetch,
  };
};
