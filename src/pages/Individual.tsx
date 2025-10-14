import { IndividualDashboard } from "@/components/IndividualDashboard";

const Individual = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Wallet</h1>
          <p className="text-muted-foreground">Manage your earnings and payments</p>
        </div>
        <IndividualDashboard />
      </div>
    </div>
  );
};

export default Individual;
