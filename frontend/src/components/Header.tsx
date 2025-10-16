import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAccount, useDisconnect } from "wagmi";
import { useAztecWallet } from "@/contexts/AztecWalletContext";
import { WalletConnect } from "./WalletConnect";
import { Copy, LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";

interface WalletDisplayProps {
  address: string;
  walletType: "ethereum" | "aztec";
  onDisconnect: () => void;
}

const WalletDisplay = ({ address, walletType, onDisconnect }: WalletDisplayProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied!");
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Wallet className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-mono">
          {address.substring(0, 6)}...{address.substring(address.length - 4)}
        </span>
        <span className="text-xs text-muted-foreground">
          {walletType === "ethereum" ? "ETH" : "AZTEC"}
        </span>
      </div>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg z-50">
          <div
            className="flex items-center gap-2 px-4 py-2 hover:bg-accent cursor-pointer rounded-t-lg"
            onClick={handleCopyAddress}
          >
            <Copy className="w-4 h-4" />
            <span className="text-sm">Copy Address</span>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 hover:bg-accent cursor-pointer text-destructive rounded-b-lg"
            onClick={() => {
              onDisconnect();
              setShowDropdown(false);
            }}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Disconnect</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const Header = () => {
  const location = useLocation();
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const { disconnect: disconnectEth } = useDisconnect();
  const { aztecAccount, isConnected: isAztecConnected, connect: connectAztec, disconnect: disconnectAztec } = useAztecWallet();
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Determine if we're on the individual page
  const isIndividualPage = location.pathname === "/" || location.pathname === "/individual";

  const isAnyWalletConnected = isEthConnected || isAztecConnected;

  // Close modal when wallet connects
  useEffect(() => {
    if (isEthConnected || isAztecConnected) {
      setShowConnectModal(false);
    }
  }, [isEthConnected, isAztecConnected]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold tracking-tight leading-none">FLCU</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none">First Lunar Credit Union</p>
        </div>

        <div className="flex items-center gap-3">
          {/* For Individual Page - Only Aztec Wallet */}
          {isIndividualPage ? (
            <>
              {!isAztecConnected ? (
                <button
                  onClick={connectAztec}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-medium">Connect Aztec Wallet</span>
                </button>
              ) : (
                aztecAccount && (
                  <WalletDisplay
                    address={aztecAccount.getAddress ? aztecAccount.getAddress().toString() : aztecAccount.address}
                    walletType="aztec"
                    onDisconnect={disconnectAztec}
                  />
                )
              )}
            </>
          ) : (
            /* For Business Page - Both Wallets */
            <>
              {!isAnyWalletConnected ? (
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-medium">Connect Wallet</span>
                </button>
              ) : (
                <>
                  {isEthConnected && ethAddress && (
                    <WalletDisplay
                      address={ethAddress}
                      walletType="ethereum"
                      onDisconnect={disconnectEth}
                    />
                  )}

                  {isAztecConnected && aztecAccount && (
                    <WalletDisplay
                      address={aztecAccount.getAddress ? aztecAccount.getAddress().toString() : aztecAccount.address}
                      walletType="aztec"
                      onDisconnect={disconnectAztec}
                    />
                  )}

                  {isEthConnected && !isAztecConnected && (
                    <button
                      onClick={connectAztec}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-sm"
                    >
                      <Wallet className="w-4 h-4" />
                      Connect Aztec
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Connect Wallet</h2>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <WalletConnect />
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Connect MetaMask first, then connect Obsidian wallet for Aztec payments
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
