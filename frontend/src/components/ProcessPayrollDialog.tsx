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
import { useAccount } from "wagmi";
import { ethers } from "ethers";

// Human Bridge contracts on Sepolia
const BRIDGE_CONTRACTS = {
  PORTAL: '0x069840ae19473e452792c8e17fee77d78a3fcecb',
  TOKEN: '0x93527f0552bef5fafc340bceac6a5a37b6c34496',
};

// ERC20 ABI (minimal)
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

// Portal Bridge ABI (minimal)
const PORTAL_ABI = [
  'function depositToAztecPublic(bytes32 to, uint256 amount, bytes32 secretHash) payable',
];

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
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [usePrivateBalance, setUsePrivateBalance] = useState(true);
  const [currentStep, setCurrentStep] = useState("");

  const handleProcessPayroll = async () => {
    if (!address || !window.ethereum) {
      toast.error("Please connect your Ethereum wallet");
      return;
    }

    setIsProcessing(true);
    try {
      // Setup provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Total amount in token decimals (assuming 6 decimals for USDC)
      const totalAmountWei = ethers.parseUnits(totalAmount.toString(), 6);

      // Setup contracts
      const tokenContract = new ethers.Contract(BRIDGE_CONTRACTS.TOKEN, ERC20_ABI, signer);
      const portalContract = new ethers.Contract(BRIDGE_CONTRACTS.PORTAL, PORTAL_ABI, signer);

      // Step 1: Check allowance
      setCurrentStep("Checking token allowance...");
      const allowance = await tokenContract.allowance(address, BRIDGE_CONTRACTS.PORTAL);

      // Step 2: Approve if needed
      if (allowance < totalAmountWei) {
        setCurrentStep("Requesting token approval...");
        toast.info("Please approve token spending in your wallet");

        const approveTx = await tokenContract.approve(BRIDGE_CONTRACTS.PORTAL, totalAmountWei);
        setCurrentStep("Waiting for approval confirmation...");
        await approveTx.wait();
        toast.success("Token approval confirmed");
      }

      // Step 3: Process each employee payment through bridge
      setCurrentStep("Processing payments through bridge...");
      const successfulPayments = [];
      const failedPayments = [];

      for (let i = 0; i < employees.length; i++) {
        const employee = employees[i];
        try {
          setCurrentStep(`Paying ${employee.name} (${i + 1}/${employees.length})...`);

          // Convert employee wallet address to bytes32
          const aztecAddressBytes32 = employee.wallet_address.startsWith('0x')
            ? employee.wallet_address.padEnd(66, '0')
            : '0x' + employee.wallet_address.padEnd(64, '0');

          // Generate random secret hash
          const secretHash = ethers.hexlify(ethers.randomBytes(32));

          // Amount in token decimals
          const amount = ethers.parseUnits(employee.salary_amount.toString(), 6);

          toast.info(`Sending ${employee.salary_amount} USDC to ${employee.name} via bridge...`);

          // Call bridge deposit
          const depositTx = await portalContract.depositToAztecPublic(
            aztecAddressBytes32,
            amount,
            secretHash,
            { gasLimit: 500000 }
          );

          setCurrentStep(`Confirming payment to ${employee.name}...`);
          const receipt = await depositTx.wait();

          if (receipt.status === 1) {
            successfulPayments.push(employee.name);
            toast.success(`✅ Paid ${employee.name}`);
          } else {
            throw new Error("Transaction failed");
          }

        } catch (error: any) {
          console.error(`Failed to pay ${employee.name}:`, error);
          failedPayments.push(employee.name);
          toast.error(`Failed to pay ${employee.name}: ${error.message}`);
        }
      }

      // Summary
      if (failedPayments.length === 0) {
        toast.success(`Successfully paid all ${employees.length} employees!`);
      } else {
        toast.warning(`Paid ${successfulPayments.length}/${employees.length} employees. ${failedPayments.length} failed.`);
      }

      // Reset and close
      onOpenChange(false);
    } catch (error: any) {
      console.error("Payroll processing error:", error);
      toast.error(error.message || "Failed to process payroll");
    } finally {
      setIsProcessing(false);
      setCurrentStep("");
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

          {/* Current Step Indicator */}
          {isProcessing && currentStep && (
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="animate-spin text-primary">⏳</span>
              <div>
                <p className="text-sm font-medium">{currentStep}</p>
                <p className="text-xs text-muted-foreground mt-1">Please confirm transactions in your wallet</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex items-start gap-3 p-3 bg-accent/5 border border-accent/20 rounded-lg">
            <Shield className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Payments will be sent from your Ethereum wallet via the Human Bridge to employees' Aztec addresses. Make sure you have enough USDC and ETH for gas fees.
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              This action cannot be undone. Make sure all employee wallet addresses are correct before proceeding.
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
