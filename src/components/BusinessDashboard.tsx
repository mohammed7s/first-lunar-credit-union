import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, TrendingUp, DollarSign } from "lucide-react";
import { EmployeeTable } from "./EmployeeTable";
import { CSVUpload } from "./CSVUpload";
import { useState } from "react";

interface Employee {
  name: string;
  wallet: string;
  amount: string;
}

export const BusinessDashboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    { name: "Alice Johnson", wallet: "0x742d...3c4f", amount: "$5,000" },
    { name: "Bob Smith", wallet: "0x8f3a...9d2e", amount: "$4,500" },
    { name: "Carol Williams", wallet: "0x1a2b...7c8d", amount: "$6,000" },
  ]);

  const handleCSVUpload = (data: Employee[]) => {
    setEmployees(data);
  };

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-card border-border hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Payroll Balance</p>
              <p className="text-3xl font-bold font-mono terminal-glow">$127,500</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-border hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Yield Earned (APY)</p>
              <p className="text-3xl font-bold font-mono text-accent">4.2%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-border hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Employees</p>
              <p className="text-3xl font-bold font-mono">{employees.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </Card>
      </div>

      {/* CSV Upload */}
      <CSVUpload onUpload={handleCSVUpload} />

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-glow border-primary/20 hover-lift cursor-pointer group">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">Earn Yield</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Stake your payroll balance to earn competitive APY on idle funds
              </p>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Start Earning
              </Button>
            </div>
            <TrendingUp className="w-8 h-8 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-glow border-secondary/20 hover-lift cursor-pointer group">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-secondary transition-colors">Pledge Future Income</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Access capital now by pledging future payroll income
              </p>
              <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                Get Loan
              </Button>
            </div>
            <DollarSign className="w-8 h-8 text-secondary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        </Card>
      </div>

      {/* Employee Table */}
      <EmployeeTable employees={employees} />
    </div>
  );
};
