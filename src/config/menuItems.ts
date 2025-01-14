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
  Plus,
  Clock,
  PlusCircle,
  AlertCircle,
  AlertTriangle,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  LineChart,
  ArrowDownUp,
} from "lucide-react";

export const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    path: "/",
    subItems: [] 
  },
  { 
    icon: Users, 
    label: "User Management", 
    path: "/users",
    subItems: [] 
  },
  { 
    icon: User, 
    label: "Borrowers", 
    path: "/borrowers",
    subItems: [
      { icon: Users, label: "View All Borrowers", path: "/borrowers" },
      { 
        icon: UserPlus, 
        label: "Add Borrower", 
        path: "#",
        onClick: () => {} // Will be set in DashboardLayout
      },
      { icon: Upload, label: "Add Bulk Borrowers", path: "/borrowers/bulk" },
    ]
  },
  { 
    icon: FileText, 
    label: "Applications", 
    path: "/applications",
    subItems: [] 
  },
  { 
    icon: Wallet, 
    label: "Loans", 
    path: "/loans",
    subItems: [
      { icon: Eye, label: "View Loans", path: "/loans" },
      { icon: Plus, label: "Add Loan", path: "/loans/add" },
      { icon: Upload, label: "Add Bulk Loans", path: "/loans/bulk" },
    ]
  },
  { 
    icon: RefreshCcw, 
    label: "Repayments", 
    path: "/repayments",
    subItems: [
      { icon: RefreshCcw, label: "View All Repayments", path: "/repayments" },
      { icon: PlusCircle, label: "Add Repayment", path: "/repayments/add" },
      { icon: Upload, label: "Add Bulk Repayment", path: "/repayments/bulk" },
    ]
  },
  { 
    icon: PiggyBank, 
    label: "Recoveries", 
    path: "/recoveries",
    subItems: [
      { icon: AlertCircle, label: "Loans In Arrears", path: "/recoveries/arrears" },
      { icon: AlertTriangle, label: "Missed Payments", path: "/recoveries/missed" },
      { icon: DollarSign, label: "Partial Payments", path: "/recoveries/partial" },
    ]
  },
  { 
    icon: Receipt, 
    label: "Accounting", 
    path: "/accounting",
    subItems: [
      { icon: FileText, label: "Chart of Accounts", path: "/accounting/chart-of-accounts" },
      { icon: FileSpreadsheet, label: "Balance Sheet", path: "/accounting/balance-sheet" },
      { icon: LineChart, label: "Profit & Loss", path: "/accounting/profit-loss" },
      { icon: ArrowDownUp, label: "Statement of Cashflow", path: "/accounting/cashflow" },
    ]
  },
  { 
    icon: BarChart3, 
    label: "Analytics", 
    path: "/analytics",
    subItems: [] 
  },
];