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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-20"
        } overflow-hidden z-30`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className={`text-xl font-semibold text-gray-800 transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0"
            }`}>
              LoanManager
            </h1>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
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
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <DashboardHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-6 transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;