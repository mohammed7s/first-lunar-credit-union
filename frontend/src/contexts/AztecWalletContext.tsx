import { createContext, useContext, useState, ReactNode } from "react";
import { aztecSdk } from "@/lib/aztec";
import { useAccount } from "@nemi-fi/wallet-sdk/react";
import { toast } from "sonner";

interface AztecWalletContextType {
  aztecAccount: any | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const AztecWalletContext = createContext<AztecWalletContextType | undefined>(undefined);

export const AztecWalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  // Use the SDK's built-in React hook
  const account = useAccount(aztecSdk);

  const connect = async () => {
    setIsConnecting(true);
    try {
      console.log("Attempting to connect to Obsidian wallet...");

      await aztecSdk.connect("obsidion");
      console.log("Connection successful!");

      toast.success("Obsidian wallet connected!");
    } catch (error: any) {
      console.error("Error connecting to Obsidian wallet:", error);
      toast.error(error.message || "Failed to connect Obsidian wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await aztecSdk.disconnect();
      toast.success("Obsidian wallet disconnected");
    } catch (error: any) {
      console.error("Error disconnecting:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  return (
    <AztecWalletContext.Provider
      value={{
        aztecAccount: account,
        isConnecting,
        isConnected: !!account,
        connect,
        disconnect,
      }}
    >
      {children}
    </AztecWalletContext.Provider>
  );
};

export const useAztecWallet = () => {
  const context = useContext(AztecWalletContext);
  if (context === undefined) {
    throw new Error("useAztecWallet must be used within an AztecWalletProvider");
  }
  return context;
};
