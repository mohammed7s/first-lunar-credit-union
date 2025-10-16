import { Card } from "@/components/ui/card";
import { DollarSign, Loader2, Eye, EyeOff, Shield } from "lucide-react";
import { useAztecUSDCBalance } from "@/hooks/useAztecUSDCBalance";
import { useAztecWallet } from "@/contexts/AztecWalletContext";
import { useState } from "react";

export const BalanceCard = () => {
  const { aztecAccount, isConnected } = useAztecWallet();
  const { data: balance, isLoading, isError } = useAztecUSDCBalance();
  const [showBreakdown, setShowBreakdown] = useState(false);

  const formatBalance = (value: string) => {
    return parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Card className="p-6 bg-gradient-glow border-primary/20">
      <div className="space-y-4">
        {/* Main Balance Display */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground">
                Aztec USDC Balance
              </p>
              <Shield className="w-3 h-3 text-primary" />
            </div>
            {!isConnected ? (
              <p className="text-2xl font-bold font-mono text-muted-foreground">
                Not Connected
              </p>
            ) : isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-2xl font-bold font-mono">Loading...</p>
              </div>
            ) : isError ? (
              <p className="text-2xl font-bold font-mono text-destructive">
                Error Loading Balance
              </p>
            ) : (
              <>
                <p className="text-4xl font-bold font-mono text-primary">
                  ${balance ? formatBalance(balance.totalBalance) : '0.00'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {aztecAccount?.address
                    ? `${aztecAccount.address.toString().slice(0, 8)}...${aztecAccount.address.toString().slice(-6)}`
                    : 'Not connected'}
                </p>
              </>
            )}
          </div>
          <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Balance Breakdown Toggle */}
        {isConnected && !isLoading && !isError && balance && (
          <>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              {showBreakdown ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
              <span>{showBreakdown ? 'Hide' : 'Show'} Balance Breakdown</span>
            </button>

            {/* Breakdown Details */}
            {showBreakdown && (
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-accent" />
                    <span className="text-sm text-muted-foreground">Private Balance</span>
                  </div>
                  <span className="text-sm font-mono font-semibold">
                    ${formatBalance(balance.privateBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3 text-secondary" />
                    <span className="text-sm text-muted-foreground">Public Balance</span>
                  </div>
                  <span className="text-sm font-mono font-semibold">
                    ${formatBalance(balance.publicBalance)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
