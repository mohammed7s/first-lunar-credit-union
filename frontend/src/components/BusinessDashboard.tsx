import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import { EmployeeTable } from "./EmployeeTable";
import { CSVUpload } from "./CSVUpload";
import { AddEmployeeDialog } from "./AddEmployeeDialog";
import { BalanceCard } from "./BalanceCard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Employee {
  id: string;
  name: string;
  wallet_address: string;
  salary_amount: number;
}

export const BusinessDashboard = () => {
  const { organization, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  useEffect(() => {
    if (organization) {
      loadEmployees();
    }
  }, [organization]);

  const loadEmployees = async () => {
    if (!organization) return;

    setLoading(true);
    const { data, error } = await db.employees.getByOrg(organization.id);

    if (error) {
      console.error("Error loading employees:", error);
    } else if (data) {
      setEmployees(data);
    }

    setLoading(false);
  };

  const handleCSVUpload = (data: any[]) => {
    // TODO: Implement CSV upload to database
    console.log("CSV upload:", data);
  };

  if (!organization) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No organization found. Please create an organization first.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance and Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BalanceCard />
        <Card className="p-6 bg-gradient-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Employees</p>
              <p className="text-3xl font-bold font-mono">{loading ? "..." : employees.length}</p>
            </div>
            <Button size="lg" className="bg-primary" onClick={() => setIsAddEmployeeOpen(true)}>
              Add Employee
            </Button>
          </div>
        </Card>
      </div>

      {/* Employee Table */}
      {loading ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Loading employees...</p>
        </Card>
      ) : (
        <>
          <EmployeeTable employees={employees} />

          {employees.length > 0 && (
            <Card className="p-6 bg-gradient-glow border-secondary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Ready to Process Payroll?</h3>
                  <p className="text-sm text-muted-foreground">
                    Select employees and process payments via Aztec Network
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 group"
                  onClick={() => navigate("/payroll")}
                >
                  Process Payroll
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      <AddEmployeeDialog
        open={isAddEmployeeOpen}
        onOpenChange={setIsAddEmployeeOpen}
        orgId={organization.id}
        onSuccess={loadEmployees}
      />
    </div>
  );
};
