import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAztecWallet } from "@/contexts/AztecWalletContext";
import { Loader2, Wallet } from "lucide-react";

export const ObsidianWalletConnect = () => {
  const { aztecAccount, isConnecting, isConnected, connect, disconnect } = useAztecWallet();

  if (isConnected && aztecAccount) {
    return (
      <Card className="p-4 bg-gradient-glow border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Obsidian Wallet</p>
              <p className="text-xs text-muted-foreground font-mono">
                {aztecAccount.address.slice(0, 8)}...{aztecAccount.address.slice(-6)}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
        <Wallet className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Connect Obsidian Wallet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Connect your Aztec wallet to view balance and process payroll
      </p>
      <Button onClick={connect} disabled={isConnecting} className="w-full">
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
            Connecting...
          </>
        ) : (
          "Connect Obsidian Wallet"
        )}
      </Button>
    </Card>
  );
};
