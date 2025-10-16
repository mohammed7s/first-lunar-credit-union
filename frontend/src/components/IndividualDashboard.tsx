import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Building2, TrendingUp, DollarSign, ArrowUpRight, Shield, Loader2, Eye } from "lucide-react";
import { ActivityFeed } from "./ActivityFeed";
import { useAztecUSDCBalance } from "@/hooks/useAztecUSDCBalance";
import { useAztecWallet } from "@/contexts/AztecWalletContext";

export const IndividualDashboard = () => {
  const { aztecAccount, isConnected } = useAztecWallet();
  const { data: balance, isLoading, isError } = useAztecUSDCBalance();

  const formatBalance = (value: string) => {
    return parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="p-8 bg-gradient-card border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm text-muted-foreground">Your Aztec USDC Balance</p>
            <Shield className="w-4 h-4 text-primary" />
          </div>

          {!isConnected ? (
            <p className="text-3xl font-bold font-mono text-muted-foreground mb-6">
              Connect Wallet
            </p>
          ) : isLoading ? (
            <div className="flex items-center gap-2 mb-6">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-3xl font-bold font-mono">Loading...</p>
            </div>
          ) : isError ? (
            <p className="text-3xl font-bold font-mono text-destructive mb-6">
              Error Loading Balance
            </p>
          ) : (
            <p className="text-5xl font-bold font-mono terminal-glow mb-6">
              ${balance ? formatBalance(balance.totalBalance) : '0.00'}
            </p>
          )}

          <div className="flex gap-3">
            <div className="flex-1 bg-muted/20 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Shield className="w-3 h-3 text-accent" />
                <p className="text-xs text-muted-foreground">Private</p>
              </div>
              <p className="text-lg font-mono font-semibold">
                ${balance ? formatBalance(balance.privateBalance) : '0.00'}
              </p>
            </div>
            <div className="flex-1 bg-muted/20 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <Eye className="w-3 h-3 text-secondary" />
                <p className="text-xs text-muted-foreground">Public</p>
              </div>
              <p className="text-lg font-mono font-semibold text-secondary">
                ${balance ? formatBalance(balance.publicBalance) : '0.00'}
              </p>
            </div>
          </div>

          {aztecAccount && (
            <p className="text-xs text-muted-foreground mt-3">
              Wallet: {aztecAccount.address.toString().slice(0, 8)}...{aztecAccount.address.toString().slice(-6)}
            </p>
          )}
        </div>
      </Card>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-glow border-primary/20 hover-lift cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Send to Bank Account</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Transfer funds directly to your linked bank account
          </p>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Transfer
          </Button>
        </Card>

        <Card className="p-6 bg-gradient-glow border-primary/20 hover-lift cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Send to Crypto Wallet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Send funds to any onchain wallet address
          </p>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Send Crypto
          </Button>
        </Card>

        <Card className="p-6 bg-gradient-glow border-accent/20 hover-lift cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Stake to Earn Yield</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Stake your balance and earn competitive APY
          </p>
          <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            Start Staking
          </Button>
        </Card>

        <Card className="p-6 bg-gradient-glow border-secondary/20 hover-lift cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <DollarSign className="w-6 h-6 text-secondary" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Pledge Future Income</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Access capital now against your future earnings
          </p>
          <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
            Apply for Loan
          </Button>
        </Card>
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  );
};
