
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
    },
    {
      title: "Pending Applications",
      value: metrics.pending_applications_count.toString(),
      subtitle: "Awaiting Review",
      icon: FileText,
    },
    {
      title: "At Risk Loans",
      value: metrics.at_risk_loans_count.toString(),
      subtitle: "Require Attention",
      icon: AlertCircle,
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
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center justify-between">
            <stat.icon className={`h-5 w-5 ${stat.alert ? 'text-destructive' : 'text-muted-foreground'}`} />
            <span className="text-xs font-medium">{stat.subtitle}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            <p className="text-xs text-muted-foreground">{stat.title}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardMetrics;
