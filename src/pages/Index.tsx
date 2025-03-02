
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, FileText, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

const data = [
  { name: "Jan", amount: 4000 },
  { name: "Feb", amount: 3000 },
  { name: "Mar", amount: 2000 },
  { name: "Apr", amount: 2780 },
  { name: "May", amount: 1890 },
  { name: "Jun", amount: 2390 },
];

const Index = () => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    try {
      // Simulate data loading
      console.log("Index component mounted");
      setIsLoaded(true);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
    }
  }, []);

  const stats = [
    {
      title: "Total Loans",
      value: "$432,560",
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: "Active Borrowers",
      value: "1,245",
      change: "+4.75%",
      isPositive: true,
      icon: Users,
    },
    {
      title: "Pending Applications",
      value: "38",
      change: "-2.35%",
      isPositive: false,
      icon: FileText,
    },
    {
      title: "At Risk Loans",
      value: "12",
      change: "+1.23%",
      isPositive: false,
      icon: AlertCircle,
    },
  ];

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="p-6 text-center">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6 glass-card">
            <div className="flex items-center justify-between">
              <stat.icon className="w-5 h-5 text-gray-600" />
              <span
                className={`flex items-center text-sm ${
                  stat.isPositive ? "text-success" : "text-destructive"
                }`}
              >
                {stat.change}
                {stat.isPositive ? (
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 ml-1" />
                )}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="p-6 glass-card">
        <h2 className="mb-4 text-lg font-medium text-gray-800">Loan Disbursements</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Bar
                dataKey="amount"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6 glass-card">
        <h2 className="mb-4 text-lg font-medium text-gray-800">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  New loan application received
                </p>
                <p className="text-sm text-gray-500">John Doe - $25,000</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Index;
