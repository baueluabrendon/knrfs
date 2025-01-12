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
    subItems: [] 
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
    subItems: [] 
  },
  { 
    icon: BarChart3, 
    label: "Analytics", 
    path: "/analytics",
    subItems: [] 
  },
];