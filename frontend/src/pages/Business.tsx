import { BusinessDashboard } from "@/components/BusinessDashboard";

const Business = () => {
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
