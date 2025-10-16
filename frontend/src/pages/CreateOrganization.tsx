import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { db } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const CreateOrganization = () => {
  const { address } = useAccount();
  const navigate = useNavigate();
  const { refreshOrganization } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    treasury_address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet first");
      navigate("/auth");
      return;
    }

    if (!formData.name || !formData.treasury_address) {
      toast.error("All fields are required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get or create user
      const { data: existingUser } = await db.users.getByWallet(address.toLowerCase());
      let userId = existingUser?.id;

      if (!userId) {
        const { data: newUser, error: userError } = await db.users.create(
          address.toLowerCase(),
          'metamask'
        );

        if (userError || !newUser) {
          throw new Error("Failed to create user");
        }
        userId = newUser.id;
      }

      // Create organization
      const { data: org, error: orgError } = await db.organizations.create(
        formData.name,
        userId,
        formData.treasury_address,
        1 // Default to Ethereum mainnet
      );

      if (orgError || !org) {
        throw orgError || new Error("Failed to create organization");
      }

      // Refresh organization in auth context
      await refreshOrganization();

      toast.success("Organization created successfully!");
      navigate("/business");
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast.error(error.message || "Failed to create organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="p-8 max-w-md w-full bg-gradient-card border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Organization</h1>
          <p className="text-muted-foreground">
            Set up your organization to start managing payroll on Aztec
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Organization Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Acme Corp"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              The name of your company or organization
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treasury_address">
              Treasury Wallet Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="treasury_address"
              placeholder="0x..."
              value={formData.treasury_address}
              onChange={(e) => setFormData({ ...formData, treasury_address: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Your organization's Aztec wallet address for holding and distributing payroll funds
            </p>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Connected Wallet:</strong>
              <br />
              <code className="text-xs font-mono">{address || "Not connected"}</code>
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Creating Organization..." : "Create Organization"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/auth")}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateOrganization;
