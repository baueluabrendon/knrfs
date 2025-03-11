
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
    path: "#",
    subItems: [
      { icon: Users, label: "View All Borrowers", path: "/admin/borrowers" },
      { icon: UserPlus, label: "Add Borrower", path: "#" },
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
    path: "/admin/loans/view", // Changed to direct link to Loans page
    subItems: [] // Removed dropdown items
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
    icon: Receipt, 
    label: "Accounting", 
    path: "#",
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
