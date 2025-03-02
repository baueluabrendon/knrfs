
import {
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  RefreshCcw,
  PiggyBank,
  BarChart3,
  User,
  UserPlus,
  Upload,
  Eye,
  Receipt,
  FileSpreadsheet,
  LineChart,
  ArrowDownUp,
  AlertOctagon,
  AlertTriangle as AlertIcon,
  DollarSign as MoneyIcon,
} from "lucide-react";

export const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    path: "/admin",  // Changed from "/" to "/admin"
    subItems: [] 
  },
  { 
    icon: Users, 
    label: "User Management", 
    path: "/admin/users",
    subItems: [] 
  },
  { 
    icon: User, 
    label: "Borrowers", 
    path: "#",  // Changed to "#" to prevent navigation
    subItems: [
      { icon: Users, label: "View All Borrowers", path: "/admin/borrowers" },
      { icon: UserPlus, label: "Add Borrower", path: "#" }, // Handled in DashboardLayout
      { icon: Upload, label: "Add Bulk Borrowers", path: "/admin/borrowers/bulk" },
    ]
  },
  { 
    icon: FileText, 
    label: "Applications", 
    path: "/admin/applications",
    subItems: [] 
  },
  { 
    icon: Wallet, 
    label: "Loans", 
    path: "#", // Changed to "#"
    subItems: [
      { icon: Eye, label: "View Loans", path: "/admin/loans/view" }, // Updated to match route
      { icon: Upload, label: "Add Bulk Loans", path: "/admin/loans/bulk" },
    ]
  },
  { 
    icon: RefreshCcw, 
    label: "Repayments", 
    path: "#", // Changed to "#"
    subItems: [
      { icon: Eye, label: "View All Repayments", path: "/admin/repayments" },
      { icon: Upload, label: "Add Bulk Repayment", path: "/admin/repayments/bulk" },
    ]
  },
  { 
    icon: PiggyBank, 
    label: "Recoveries", 
    path: "#", // Changed to "#"
    subItems: [
      { icon: AlertOctagon, label: "Loans In Arrears", path: "/admin/recoveries/loans-in-arrears" }, // Fixed path
      { icon: AlertIcon, label: "Missed Payments", path: "/admin/recoveries/missed-payments" }, // Fixed path
      { icon: MoneyIcon, label: "Partial Payments", path: "/admin/recoveries/partial-payments" }, // Fixed path
    ]
  },
  { 
    icon: Receipt, 
    label: "Accounting", 
    path: "#", // Changed to "#"
    subItems: [
      { icon: FileText, label: "Chart of Accounts", path: "/admin/accounting/chart-of-accounts" },
      { icon: FileSpreadsheet, label: "Balance Sheet", path: "/admin/accounting/balance-sheet" },
      { icon: LineChart, label: "Profit & Loss", path: "/admin/accounting/profit-loss" },
      { icon: ArrowDownUp, label: "Statement of Cashflow", path: "/admin/accounting/cashflow" },
    ]
  },
  { 
    icon: BarChart3, 
    label: "Analytics", 
    path: "/admin/analytics",
    subItems: [] 
  },
];
