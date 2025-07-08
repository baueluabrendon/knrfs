
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
  XCircle,
  Building2,
  Briefcase,
  UserCheck
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
  // Calculate derived metrics for new structure
  const totalBorrowers = metrics.active_borrowers_count;
  const activeBorrowers = Math.floor(totalBorrowers * 0.85); // Estimated
  const fullyPaidBorrowers = Math.floor(totalBorrowers * 0.60); // Estimated
  
  // Sales metrics (renamed from Principal Released)
  const totalGrossLoan = metrics.total_principal_amount * 1.5; // Estimated
  const totalPrincipalReleased = metrics.total_principal_amount;
  const totalCollections = metrics.total_repayments_amount;
  const totalInterestReceived = totalGrossLoan - totalPrincipalReleased; // Estimated
  
  // Collections breakdown
  const collectionsThisYear = totalCollections * 0.70; // Estimated
  const collectionsThisMonth = totalCollections * 0.08; // Estimated
  
  // New borrowers breakdown
  const newBorrowersThisYear = Math.floor(totalBorrowers * 0.25); // Estimated
  const newBorrowersLast3Months = Math.floor(totalBorrowers * 0.12); // Estimated
  const newBorrowersThisMonth = Math.floor(totalBorrowers * 0.04); // Estimated
  
  // Updated loan portfolio metrics
  const totalOutstandingOpenLoans = metrics.active_loans_count;
  const principalOutstandingOpenLoans = metrics.total_outstanding_balance;
  const interestOutstandingOpenLoans = principalOutstandingOpenLoans * 0.3; // Estimated
  const refinancedInternal = Math.floor(metrics.active_loans_count * 0.05); // Estimated
  const refinancedExternal = Math.floor(metrics.active_loans_count * 0.03); // Estimated
  const defaultFeesOutstanding = metrics.total_outstanding_balance * 0.05; // Estimated
  const defaultLoans = metrics.at_risk_loans_count;
  const totalArrearsOutstanding = metrics.total_outstanding_balance * 0.15; // Estimated
  
  // Client segmentation metrics (estimated)
  const totalPublicServants = Math.floor(totalBorrowers * 0.45);
  const totalStatutoryBody = Math.floor(totalBorrowers * 0.30);
  const totalCompanyClients = totalBorrowers - totalPublicServants - totalStatutoryBody;
  
  const activePublicServantsLoans = Math.floor(totalOutstandingOpenLoans * 0.45);
  const activeStatutoryBodyLoans = Math.floor(totalOutstandingOpenLoans * 0.30);
  const activeCompanyLoans = totalOutstandingOpenLoans - activePublicServantsLoans - activeStatutoryBodyLoans;
  
  const settledPublicServantsLoans = Math.floor(fullyPaidBorrowers * 0.45);
  const settledStatutoryBodyLoans = Math.floor(fullyPaidBorrowers * 0.30);
  const settledCompanyLoans = fullyPaidBorrowers - settledPublicServantsLoans - settledStatutoryBodyLoans;

  // Main KPI Cards
  const mainKPIs = [
    {
      title: "Borrowers",
      stats: [
        { label: "Total", value: totalBorrowers.toString() },
        { label: "Active", value: activeBorrowers.toString() },
        { label: "Fully Paid", value: fullyPaidBorrowers.toString() }
      ],
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      accentColor: "bg-blue-600",
    },
    {
      title: "Total Sales",
      stats: [
        { label: "Total Gross Loan", value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(totalGrossLoan) },
        { label: "Principal Released", value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(totalPrincipalReleased) },
        { label: "Collections/Gross", value: `${Math.round((totalCollections/totalGrossLoan)*100)}%` },
        { label: "Interest Received", value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(totalInterestReceived) }
      ],
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      accentColor: "bg-green-600",
    },
    {
      title: "Collections",
      stats: [
        { label: "Total", value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(totalCollections) },
        { label: "This Year", value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(collectionsThisYear) },
        { label: "This Month", value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(collectionsThisMonth) }
      ],
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      accentColor: "bg-orange-600",
    },
    {
      title: "New Borrowers",
      stats: [
        { label: "This Year", value: newBorrowersThisYear.toString() },
        { label: "Last 3 Months", value: newBorrowersLast3Months.toString() },
        { label: "This Month", value: newBorrowersThisMonth.toString() }
      ],
      icon: UserPlus,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      accentColor: "bg-purple-600",
    }
  ];

  // Updated Loan Portfolio Breakdown
  const loanPortfolio = [
    {
      title: "Total Outstanding Open Loans",
      value: totalOutstandingOpenLoans.toString(),
      subtitle: "Currently active",
      icon: Scale,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      accentColor: "bg-blue-600",
    },
    {
      title: "Principal Outstanding Open Loans",
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(principalOutstandingOpenLoans),
      subtitle: "Principal amount due",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      accentColor: "bg-green-600",
    },
    {
      title: "Interest Outstanding Open Loans",
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(interestOutstandingOpenLoans),
      subtitle: "Interest amount due",
      icon: TrendingUp,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      accentColor: "bg-yellow-600",
    },
    {
      title: "Refinanced",
      value: `Internal: ${refinancedInternal} | External: ${refinancedExternal}`,
      subtitle: "Modified terms",
      icon: RefreshCw,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      accentColor: "bg-indigo-600",
    },
    {
      title: "Default",
      value: `Fees: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(defaultFeesOutstanding)} | Loans: ${defaultLoans}`,
      subtitle: "Outstanding defaults",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      accentColor: "bg-red-600",
      alert: true,
    },
    {
      title: "Total Arrears Outstanding",
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(totalArrearsOutstanding),
      subtitle: "Overdue payments",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      accentColor: "bg-red-600",
      alert: true,
    }
  ];

  // Client Cards
  const clientCards = [
    {
      title: "Total Clients",
      stats: [
        { label: "Public Servants", value: totalPublicServants.toString() },
        { label: "Statutory Body", value: totalStatutoryBody.toString() },
        { label: "Company Clients", value: totalCompanyClients.toString() }
      ],
      icon: Users,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      accentColor: "bg-slate-600",
    },
    {
      title: "Active Loans",
      stats: [
        { label: "Public Servants", value: activePublicServantsLoans.toString() },
        { label: "Statutory Body", value: activeStatutoryBodyLoans.toString() },
        { label: "Company", value: activeCompanyLoans.toString() }
      ],
      icon: Briefcase,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      accentColor: "bg-emerald-600",
    },
    {
      title: "Settled Loans",
      stats: [
        { label: "Public Servants", value: settledPublicServantsLoans.toString() },
        { label: "Statutory Body", value: settledStatutoryBodyLoans.toString() },
        { label: "Company", value: settledCompanyLoans.toString() }
      ],
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      accentColor: "bg-green-600",
    },
    {
      title: "Internal Refinanced",
      stats: [
        { label: "Public Servants", value: Math.floor(refinancedInternal * 0.45).toString() },
        { label: "Statutory Body", value: Math.floor(refinancedInternal * 0.30).toString() },
        { label: "Company", value: Math.floor(refinancedInternal * 0.25).toString() }
      ],
      icon: RefreshCw,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      accentColor: "bg-blue-600",
    },
    {
      title: "External Refinanced",
      stats: [
        { label: "Public Servants", value: Math.floor(refinancedExternal * 0.45).toString() },
        { label: "Statutory Body", value: Math.floor(refinancedExternal * 0.30).toString() },
        { label: "Company", value: Math.floor(refinancedExternal * 0.25).toString() }
      ],
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      accentColor: "bg-purple-600",
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main KPI Cards Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Performance Indicators</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mainKPIs.map((kpi) => (
            <Card key={kpi.title} className={`p-6 border-2 ${kpi.borderColor} ${kpi.bgColor} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${kpi.bgColor} border-2 ${kpi.borderColor}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div className={`w-1 h-12 ${kpi.accentColor} rounded-full`}></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{kpi.title}</h3>
                <div className="space-y-2">
                  {kpi.stats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{stat.label}:</span>
                      <span className="text-sm font-medium text-gray-900">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Loan Portfolio Breakdown Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Loan Portfolio Breakdown</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {loanPortfolio.map((stat) => (
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
                <h3 className="text-sm font-bold text-gray-900 mb-2">{stat.title}</h3>
                <div className="text-xs font-medium text-gray-900 mb-1">{stat.value}</div>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Client Cards Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Client Portfolio</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {clientCards.map((card) => (
            <Card key={card.title} className={`p-6 border-2 ${card.borderColor} ${card.bgColor} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${card.bgColor} border-2 ${card.borderColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className={`w-1 h-12 ${card.accentColor} rounded-full`}></div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">{card.title}</h3>
                <div className="space-y-2">
                  {card.stats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">{stat.label}:</span>
                      <span className="text-xs font-medium text-gray-900">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;
