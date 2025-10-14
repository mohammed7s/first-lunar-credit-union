import { Card } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight, TrendingUp, DollarSign } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "received",
    description: "Payroll received",
    amount: "$5,000.00",
    date: "2 hours ago",
    icon: ArrowDownLeft,
    color: "text-accent",
  },
  {
    id: 2,
    type: "sent",
    description: "Transfer to bank account",
    amount: "$1,200.00",
    date: "1 day ago",
    icon: ArrowUpRight,
    color: "text-primary",
  },
  {
    id: 3,
    type: "stake",
    description: "Staked for yield",
    amount: "$2,000.00",
    date: "3 days ago",
    icon: TrendingUp,
    color: "text-accent",
  },
  {
    id: 4,
    type: "received",
    description: "Payroll received",
    amount: "$5,000.00",
    date: "1 week ago",
    icon: ArrowDownLeft,
    color: "text-accent",
  },
];

export const ActivityFeed = () => {
  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">Your latest transactions</p>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center ${activity.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">{activity.date}</p>
                </div>
              </div>
              <p className={`font-mono font-semibold ${activity.color}`}>
                {activity.type === "sent" ? "-" : "+"}{activity.amount}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
