import { BusinessDashboard } from "@/components/BusinessDashboard";
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
import { Building2, ArrowRight } from "lucide-react";

const Business = () => {
  const { organization, refreshOrganization, user } = useAuth();
  const { address } = useAccount();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
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
      let userId = existingUser?.id || user?.id;

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

      // Show success message
      toast.success(`🎉 ${formData.name} created successfully! Loading your dashboard...`);

      // Refresh organization in auth context
      await refreshOrganization();

      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force re-render by navigating
      navigate("/business", { replace: true });

      // Clean up form
      setShowCreateForm(false);
      setFormData({ name: "", treasury_address: "" });
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast.error(error.message || "Failed to create organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no organization, show create organization UI
  if (!organization && !showCreateForm) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Card className="p-8 max-w-2xl w-full bg-gradient-card border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to FLCU Business</h1>
            <p className="text-muted-foreground text-lg">
              Create your organization to start managing payroll on Aztec Network
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">1</span>
                </div>
                <p className="text-sm">Create Organization</p>
              </div>
              <div className="text-center p-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <span className="text-accent font-bold">2</span>
                </div>
                <p className="text-sm">Add Employees</p>
              </div>
              <div className="text-center p-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="text-secondary font-bold">3</span>
                </div>
                <p className="text-sm">Process Payroll</p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 group"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your Organization
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show create organization form
  if (!organization && showCreateForm) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
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

            <div className="space-y-3">
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
                onClick={() => setShowCreateForm(false)}
                className="w-full"
              >
                Back
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Show dashboard if organization exists
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Business Dashboard</h1>
          <p className="text-muted-foreground">Manage your payroll and team payments</p>
        </div>
        <BusinessDashboard />
      </div>
    </div>
  );
};

export default Business;
