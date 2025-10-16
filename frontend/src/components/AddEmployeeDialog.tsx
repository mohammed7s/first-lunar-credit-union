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
import { toast } from "sonner";
import { db } from "@/lib/supabase";

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  onSuccess: () => void;
}

export const AddEmployeeDialog = ({
  open,
  onOpenChange,
  orgId,
  onSuccess,
}: AddEmployeeDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    wallet_address: "",
    salary_amount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.wallet_address) {
      toast.error("Name and Aztec address are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await db.employees.create({
        org_id: orgId,
        name: formData.name,
        wallet_address: formData.wallet_address,
        salary_amount: formData.salary_amount ? parseFloat(formData.salary_amount) : 0,
      });

      if (error) {
        throw error;
      }

      toast.success("Employee added successfully");
      setFormData({ name: "", email: "", wallet_address: "", salary_amount: "" });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast.error(error.message || "Failed to add employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Add a new employee to your payroll. Enter their Aztec wallet address to enable private payments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet_address">
                Aztec Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="wallet_address"
                placeholder="0x..."
                value={formData.wallet_address}
                onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                The employee's Aztec wallet address for receiving private payments
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_amount">Salary Amount (USDC)</Label>
              <Input
                id="salary_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="5000"
                value={formData.salary_amount}
                onChange={(e) => setFormData({ ...formData, salary_amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
