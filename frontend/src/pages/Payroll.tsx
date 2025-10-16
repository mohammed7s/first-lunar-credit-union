import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { db } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useAztecUSDCBalance } from "@/hooks/useAztecUSDCBalance";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProcessPayrollDialog } from "@/components/ProcessPayrollDialog";

interface Employee {
  id: string;
  name: string;
  wallet_address: string;
  salary_amount: number;
}

const Payroll = () => {
  const { organization } = useAuth();
  const { data: aztecBalance, isLoading: balanceLoading } = useAztecUSDCBalance();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const balanceNumber = aztecBalance ? parseFloat(aztecBalance.totalBalance) : 0;
  const formattedBalance = aztecBalance?.totalBalance || "0";

  useEffect(() => {
    loadEmployees();
  }, [organization]);

  const loadEmployees = async () => {
    if (!organization) return;

    setLoading(true);
    const { data, error } = await db.employees.getByOrg(organization.id);

    if (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employees");
    } else if (data) {
      setEmployees(data);
      // Select all employees by default
      setSelectedEmployees(new Set(data.map((e) => e.id)));
    }

    setLoading(false);
  };

  const toggleEmployee = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const toggleAll = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map((e) => e.id)));
    }
  };

  const selectedEmployeesList = employees.filter((e) =>
    selectedEmployees.has(e.id)
  );

  const totalPayroll = selectedEmployeesList.reduce(
    (sum, emp) => sum + emp.salary_amount,
    0
  );

  const hasSufficientBalance = balanceNumber >= totalPayroll;

  if (!organization) {
    return (
      <div className="p-8">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            No organization found. Please create an organization first.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Process Payroll</h1>
        <p className="text-muted-foreground">
          Select employees to pay and choose your payment source
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-glow border-primary/20">
          <p className="text-sm text-muted-foreground mb-1">
            Available Balance (Aztec)
          </p>
          {balanceLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="text-2xl font-bold font-mono">Loading...</p>
            </div>
          ) : (
            <p className="text-3xl font-bold font-mono">
              ${parseFloat(formattedBalance).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </Card>

        <Card className="p-6 bg-gradient-glow border-accent/20">
          <p className="text-sm text-muted-foreground mb-1">Total Payroll</p>
          <p className="text-3xl font-bold font-mono">
            ${totalPayroll.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedEmployees.size} of {employees.length} employees selected
          </p>
        </Card>

        <Card
          className={`p-6 ${
            hasSufficientBalance
              ? "bg-gradient-glow border-secondary/20"
              : "bg-gradient-glow border-destructive/20"
          }`}
        >
          <p className="text-sm text-muted-foreground mb-1">Status</p>
          <p
            className={`text-2xl font-bold ${
              hasSufficientBalance ? "text-secondary" : "text-destructive"
            }`}
          >
            {hasSufficientBalance ? "✓ Ready" : "⚠ Insufficient"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {hasSufficientBalance
              ? "Sufficient balance to process"
              : "Need more funds"}
          </p>
        </Card>
      </div>

      {/* Employee Selection */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Select Employees</h2>
          <Button variant="outline" size="sm" onClick={toggleAll}>
            {selectedEmployees.size === employees.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : employees.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No employees found. Add employees first.
          </p>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedEmployees.has(employee.id)}
                    onCheckedChange={() => toggleEmployee(employee.id)}
                  />
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {employee.wallet_address.slice(0, 6)}...
                      {employee.wallet_address.slice(-4)}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-mono font-semibold">
                  ${employee.salary_amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Next: Choose payment source and process payroll
            </p>
          </div>
          <Button
            size="lg"
            disabled={selectedEmployees.size === 0 || !hasSufficientBalance}
            className="group"
            onClick={() => setShowPaymentDialog(true)}
          >
            Continue to Payment
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>

      {/* Payment Dialog */}
      <ProcessPayrollDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        employees={selectedEmployeesList}
        totalAmount={totalPayroll}
        availableBalance={balanceNumber}
      />
    </div>
  );
};

export default Payroll;
