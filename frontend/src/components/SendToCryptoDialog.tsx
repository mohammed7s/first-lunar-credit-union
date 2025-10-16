import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Send } from "lucide-react";
import { toast } from "sonner";

interface SendToCryptoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: string;
}

export const SendToCryptoDialog = ({
  open,
  onOpenChange,
  availableBalance,
}: SendToCryptoDialogProps) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!recipientAddress || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      toast.error("Invalid Ethereum address format");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Invalid amount");
      return;
    }

    if (amountNum > parseFloat(availableBalance)) {
      toast.error("Insufficient balance");
      return;
    }

    setIsSending(true);
    try {
      // TODO: Implement actual transfer from Aztec private to Ethereum public
      // This will involve:
      // 1. Shield tokens from private Aztec balance
      // 2. Transfer to L1 Ethereum address
      // 3. Use token contract's transfer_to_public method

      toast.info("Transfer functionality coming soon...");

      // Mock success after delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(`Sent ${amount} USDC to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`);

      // Reset form
      setRecipientAddress("");
      setAmount("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error(error.message || "Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(availableBalance);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send to Ethereum Address
          </DialogTitle>
          <DialogDescription>
            Transfer USDC from your private Aztec balance to an Ethereum address
          </DialogDescription>
        </DialogHeader>

        {/* Privacy Warning */}
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-destructive">Privacy Notice</p>
            <p className="text-xs text-muted-foreground">
              This transaction will move your funds from <strong>private</strong> (Aztec) to{" "}
              <strong>public</strong> (Ethereum). The recipient address and amount will be
              visible on the Ethereum blockchain.
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">
              Ethereum Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">
                Amount (USDC) <span className="text-destructive">*</span>
              </Label>
              <button
                type="button"
                onClick={handleMaxClick}
                className="text-xs text-primary hover:underline"
              >
                Max: ${parseFloat(availableBalance).toFixed(2)}
              </button>
            </div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
            />
          </div>

          {/* Summary */}
          {amount && recipientAddress && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You will send:</span>
                <span className="font-mono font-semibold">${parseFloat(amount).toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To address:</span>
                <span className="font-mono text-xs">
                  {recipientAddress.slice(0, 8)}...{recipientAddress.slice(-6)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={isSending || !recipientAddress || !amount}
            className="w-full sm:w-auto"
          >
            {isSending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to Ethereum
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
