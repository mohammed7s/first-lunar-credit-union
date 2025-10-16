import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Employee {
  id: string;
  name: string;
  wallet_address: string;
  salary_amount: number;
}

interface EmployeeTableProps {
  employees: Employee[];
}

export const EmployeeTable = ({ employees }: EmployeeTableProps) => {
  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Employee Payroll</h2>
        <p className="text-sm text-muted-foreground">Manage your team's payment details</p>
      </div>
      
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="font-semibold">Employee Name</TableHead>
              <TableHead className="font-semibold font-mono">Wallet Address</TableHead>
              <TableHead className="text-right font-semibold">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow
                key={employee.id}
                className="border-border hover:bg-muted/10 transition-colors"
              >
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell className="font-mono text-primary">{employee.wallet_address}</TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  ${employee.salary_amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
