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
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, Users, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  wallet_address: string;
  salary_amount: number;
}

interface ProcessPayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  totalAmount: number;
  availableBalance: number;
}

export const ProcessPayrollDialog = ({
  open,
  onOpenChange,
  employees,
  totalAmount,
  availableBalance,
}: ProcessPayrollDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [usePrivateBalance, setUsePrivateBalance] = useState(true);

  const handleProcessPayroll = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement actual payroll processing
      // This will involve:
      // 1. Call the payroll contract on Aztec
      // 2. Transfer USDC from organization treasury to employee wallets
      // 3. Use private or public balance based on user preference
      // 4. Record transactions in database

      toast.info("Processing payroll...");

      // Mock processing delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      toast.success(`Successfully paid ${employees.length} employees!`);

      // Reset and close
      onOpenChange(false);
    } catch (error: any) {
      console.error("Payroll processing error:", error);
      toast.error(error.message || "Failed to process payroll");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Process Payroll
          </DialogTitle>
          <DialogDescription>
            Review the payment details before processing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4 overflow-y-auto pr-2 -mr-2">
          {/* Payment Summary */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Employees</span>
              </div>
              <span className="font-semibold">{employees.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="text-lg font-mono font-bold text-primary">
                ${totalAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available Balance</span>
              <span className="text-lg font-mono font-semibold">
                ${availableBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Remaining Balance</span>
                <span className="font-mono font-bold">
                  ${(availableBalance - totalAmount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Employee List */}
          <div className="max-h-32 overflow-y-auto space-y-2 p-3 bg-muted/20 rounded-lg">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              RECIPIENTS ({employees.length})
            </p>
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between text-sm py-2"
              >
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {employee.wallet_address.slice(0, 6)}...
                    {employee.wallet_address.slice(-4)}
                  </p>
                </div>
                <span className="font-mono font-semibold">
                  ${employee.salary_amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Privacy Option */}
          <div className="flex items-start gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <Checkbox
              id="usePrivate"
              checked={usePrivateBalance}
              onCheckedChange={(checked) => setUsePrivateBalance(checked as boolean)}
            />
            <div className="flex-1">
              <label
                htmlFor="usePrivate"
                className="text-sm font-semibold cursor-pointer flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-accent" />
                Use Private Balance
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Payments will be sent privately on Aztec Network. Amounts will remain
                confidential.
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              This action cannot be undone. Make sure all employee wallet addresses are
              correct before proceeding.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4 pt-4 border-t flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleProcessPayroll}
            disabled={isProcessing}
            className="w-full sm:w-auto bg-primary"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Process Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
