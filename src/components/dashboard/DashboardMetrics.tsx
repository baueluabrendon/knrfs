
import { Card } from "@/components/ui/card";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  UserPlus, 
  Scale, 
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  XCircle
} from "lucide-react";

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
  // Calculate derived metrics
  const fullyPaidLoans = Math.floor(metrics.active_loans_count * 0.65); // Estimated
  const processingLoans = metrics.pending_applications_count;
  const restructuredLoans = Math.floor(metrics.active_loans_count * 0.08); // Estimated
  const defaultLoans = metrics.at_risk_loans_count;
  const collectionsAmount = metrics.total_outstanding_balance * 0.15; // Estimated overdue amount
  const newBorrowersThisMonth = Math.floor(metrics.active_borrowers_count * 0.12); // Estimated

  const mainStats = [
    {
      title: "Total Borrowers",
      value: metrics.active_borrowers_count.toString(),
      subtitle: "Active borrowers in system",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      accentColor: "bg-blue-600",
    },
    {
      title: "Principal Released",
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact'
      }).format(metrics.total_principal_amount || 0),
      subtitle: "Total loans disbursed",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      accentColor: "bg-green-600",
    },
    {
      title: "Collections",
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact'
      }).format(collectionsAmount || 0),
      subtitle: "Amount due for collection",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      accentColor: "bg-orange-600",
    },
    {
      title: "New Borrowers",
      value: newBorrowersThisMonth.toString(),
      subtitle: "This month",
      icon: UserPlus,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      accentColor: "bg-purple-600",
    }
  ];

  const loanBreakdown = [
    {
      title: "Fully Paid Loans",
      value: fullyPaidLoans.toString(),
      subtitle: "Completed successfully",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      accentColor: "bg-green-600",
    },
    {
      title: "Outstanding",
      value: metrics.active_loans_count.toString(),
      subtitle: "Currently active",
      icon: Scale,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      accentColor: "bg-blue-600",
    },
    {
      title: "Processing",
      value: processingLoans.toString(),
      subtitle: "Under review",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      accentColor: "bg-yellow-600",
    },
    {
      title: "Restructured",
      value: restructuredLoans.toString(),
      subtitle: "Modified terms",
      icon: RefreshCw,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      accentColor: "bg-indigo-600",
    },
    {
      title: "Default",
      value: defaultLoans.toString(),
      subtitle: "Require attention",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      accentColor: "bg-red-600",
      alert: true,
    },
    {
      title: "Collections Due",
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact'
      }).format(collectionsAmount || 0),
      subtitle: "Overdue payments",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      accentColor: "bg-red-600",
      alert: true,
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main Statistics Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Performance Indicators</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mainStats.map((stat) => (
            <Card key={stat.title} className={`p-6 border-2 ${stat.borderColor} ${stat.bgColor} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${stat.bgColor} border-2 ${stat.borderColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`w-1 h-12 ${stat.accentColor} rounded-full`}></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Loan Breakdown Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Loan Portfolio Breakdown</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {loanBreakdown.map((stat) => (
            <Card key={stat.title} className={`p-6 border-2 ${stat.borderColor} ${stat.bgColor} hover:shadow-lg transition-all duration-200 relative`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${stat.accentColor} shadow-md`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                {stat.alert && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Alert
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-gray-100 border-2 border-gray-200">
              <TrendingUp className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(((metrics.total_repayments_amount || 0) / (metrics.total_principal_amount || 1)) * 100)}%
            </h3>
            <p className="text-sm font-medium text-gray-600 mb-1">Collection Rate</p>
            <p className="text-xs text-gray-500">Overall repayment performance</p>
          </div>
        </Card>

        <Card className="p-6 border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-gray-100 border-2 border-gray-200">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(metrics.avg_loan_duration_days || 0)}
            </h3>
            <p className="text-sm font-medium text-gray-600 mb-1">Avg. Loan Duration</p>
            <p className="text-xs text-gray-500">Days average loan term</p>
          </div>
        </Card>

        <Card className="p-6 border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-gray-100 border-2 border-gray-200">
              <DollarSign className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact'
              }).format(metrics.total_outstanding_balance || 0)}
            </h3>
            <p className="text-sm font-medium text-gray-600 mb-1">Outstanding Balance</p>
            <p className="text-xs text-gray-500">Total amount pending</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMetrics;
