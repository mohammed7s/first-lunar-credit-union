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
import { UserCircle, Mail, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/supabase";

interface IndividualRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistrationComplete: (aztecAddress: string) => void;
}

export const IndividualRegistrationDialog = ({
  open,
  onOpenChange,
  onRegistrationComplete,
}: IndividualRegistrationDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState<string>("");
  const [generatedAddress, setGeneratedAddress] = useState<string>("");

  const generateAztecAddress = (): string => {
    // Mock Aztec address generation (66 hex characters with 0x prefix)
    const randomHex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    return `0x${randomHex}`;
  };

  const mockContractDeployment = async (): Promise<string> => {
    // Step 1: Initialize
    setDeploymentStep("Initializing account contract...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 2: Deploying
    setDeploymentStep("Deploying to Aztec Network...");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Step 3: Generating keys
    setDeploymentStep("Generating encryption keys...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 4: Finalizing
    setDeploymentStep("Finalizing deployment...");
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate mock Aztec address
    const aztecAddress = generateAztecAddress();
    return aztecAddress;
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsDeploying(true);

    try {
      // Mock contract deployment
      const aztecAddress = await mockContractDeployment();
      setGeneratedAddress(aztecAddress);
      setDeploymentStep("✅ Deployment complete!");

      // Save to database
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In production, you would:
      // 1. Call your backend API
      // 2. Backend deploys actual Aztec account contract
      // 3. Returns the real Aztec address
      // 4. Store in database

      // Use Aztec address as the primary wallet address for individuals
      const { data: user, error } = await db.users.create(
        aztecAddress.toLowerCase(),
        'obsidian',
        {
          name: formData.name,
          email: formData.email,
          aztec_address: aztecAddress,
        }
      );

      if (error) {
        console.error("Database error:", error);
        throw new Error("Failed to save user to database");
      }

      console.log("User registered successfully:", user);

      toast.success(`Welcome, ${formData.name}! Your Aztec account is ready.`);

      // Wait a bit to show success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onRegistrationComplete(aztecAddress);
      onOpenChange(false);

      // Reset form
      setFormData({ name: "", email: "" });
      setGeneratedAddress("");
      setDeploymentStep("");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to complete registration");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Register Your Account
          </DialogTitle>
          <DialogDescription>
            Create your private Aztec account to receive payroll payments
          </DialogDescription>
        </DialogHeader>

        {!isDeploying ? (
          <>
            <div className="space-y-4 mt-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>What happens next:</strong>
                  <br />
                  We'll deploy a private account contract on Aztec Network for you. This will
                  be your permanent address for receiving confidential payroll payments.
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleRegister}
                disabled={!formData.name || !formData.email}
                className="w-full sm:w-auto bg-primary"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Register Account
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Deployment Progress */}
            <div className="space-y-6 mt-4 py-8">
              <div className="flex flex-col items-center text-center">
                {generatedAddress ? (
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                ) : (
                  <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                )}
                <p className="text-lg font-semibold mb-2">{deploymentStep}</p>
                {generatedAddress && (
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg w-full">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Your Aztec Address
                    </p>
                    <p className="text-sm font-mono break-all">{generatedAddress}</p>
                  </div>
                )}
              </div>

              {!generatedAddress && (
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse" style={{ width: "75%" }} />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Please wait while we set up your account...
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
