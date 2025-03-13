
import {
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  RefreshCcw,
  PiggyBank,
  BarChart3,
  User,
  Users as UsersIcon,
  AlertOctagon,
  AlertTriangle as AlertIcon,
  DollarSign as MoneyIcon,
  ReceiptText, // Changed from Receipt
  Table, // Changed from FileSpreadsheet
  TrendingUp, // Changed from LineChart
  ArrowUpDown, // Changed from ArrowDownUp
} from "lucide-react";

export const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    path: "/admin",
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
    path: "/admin/borrowers",
    subItems: [] 
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
    path: "/admin/loans/view",
    subItems: [] 
  },
  { 
    icon: RefreshCcw, 
    label: "Repayments", 
    path: "/admin/repayments",
    subItems: [] 
  },
  { 
    icon: PiggyBank, 
    label: "Recoveries", 
    path: "#",
    subItems: [
      { icon: AlertOctagon, label: "Loans In Arrears", path: "/admin/recoveries/loans-in-arrears" },
      { icon: AlertIcon, label: "Missed Payments", path: "/admin/recoveries/missed-payments" },
      { icon: MoneyIcon, label: "Partial Payments", path: "/admin/recoveries/partial-payments" },
    ]
  },
  { 
    icon: ReceiptText, // Changed from Receipt
    label: "Accounting", 
    path: "#",
    subItems: [
      { icon: FileText, label: "Chart of Accounts", path: "/admin/accounting/chart-of-accounts" },
      { icon: Table, label: "Balance Sheet", path: "/admin/accounting/balance-sheet" }, // Changed from FileSpreadsheet
      { icon: TrendingUp, label: "Profit & Loss", path: "/admin/accounting/profit-loss" }, // Changed from LineChart
      { icon: ArrowUpDown, label: "Statement of Cashflow", path: "/admin/accounting/cashflow" }, // Changed from ArrowDownUp
    ]
  },
  { 
    icon: BarChart3, 
    label: "Analytics", 
    path: "/admin/analytics",
    subItems: [] 
  },
];
