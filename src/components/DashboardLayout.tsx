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
import SidebarNav from "./SidebarNav";
import DashboardHeader from "./DashboardHeader";
import SidebarHeader from "./SidebarHeader";

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
        className={`relative h-screen bg-white border-r border-gray-200 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader isOpen={isSidebarOpen} />
          <SidebarNav
            menuItems={menuItems}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            onCloseSidebar={() => setIsSidebarOpen(false)}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        <DashboardHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
