import { useState } from "react";
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
import SidebarMenuItem from "./SidebarMenuItem";
import DashboardHeader from "./DashboardHeader";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
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
        { icon: UserPlus, label: "Add Borrower", path: "/borrowers/add" },
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
        { icon: Clock, label: "Over Due Loans", path: "/loans/overdue" },
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
      subItems: [] 
    },
    { 
      icon: BarChart3, 
      label: "Analytics", 
      path: "/analytics",
      subItems: [] 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white border-r border-gray-200`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">LoanManager</h1>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <SidebarMenuItem
              key={item.label}
              {...item}
              isHovered={hoveredItem === item.label}
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
              onCloseSidebar={() => setIsSidebarOpen(false)}
            />
          ))}
        </nav>
      </aside>

      <div 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "lg:ml-64" : "ml-0"
        }`}
      >
        <DashboardHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-6 min-h-[calc(100vh-4rem)] bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
