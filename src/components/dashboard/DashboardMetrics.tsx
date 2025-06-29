
import { Card } from "@/components/ui/card";
import { DollarSign, Users, FileText, AlertCircle } from "lucide-react";

interface DashboardMetricsProps {
  metrics: {
    active_loans_count: number;
    active_borrowers_count: number;
    at_risk_loans_count: number;
    pending_applications_count: number;
    total_principal_amount: number;
    total_outstanding_balance: number;
    total_repayments_amount: number;
    avg_loan_duration_days: number;
  };
}

const DashboardMetrics = ({ metrics }: DashboardMetricsProps) => {
  const stats = [
    {
      title: "Active Loans",
      value: metrics.active_loans_count.toString(),
      subtitle: `${metrics.active_borrowers_count} Active Borrowers`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Pending Applications",
      value: metrics.pending_applications_count.toString(),
      subtitle: "Awaiting Review",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "At Risk Loans",
      value: metrics.at_risk_loans_count.toString(),
      subtitle: "Require Attention",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      alert: true,
    },
    {
      title: "Total Portfolio",
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(metrics.total_principal_amount || 0),
      subtitle: `${Math.round(((metrics.total_repayments_amount || 0) / (metrics.total_principal_amount || 1)) * 100)}% Repaid`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className={`p-6 border-2 ${stat.borderColor} ${stat.bgColor} hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full ${stat.bgColor} border ${stat.borderColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            {stat.alert && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Alert
              </span>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
            <p className="text-xs text-gray-500">{stat.subtitle}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardMetrics;
