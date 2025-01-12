import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  RefreshCcw,
  PiggyBank,
  BarChart3,
  Menu,
  User,
  UserPlus,
  Upload,
  Eye,
  Plus,
  Clock,
  PlusCircle,
} from "lucide-react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navigate = useNavigate();

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
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white border-r border-gray-200 w-64`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">LoanManager</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <div
              key={item.label}
              className="relative group"
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  hoveredItem === item.label
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </button>
              
              {item.subItems.length > 0 && hoveredItem === item.label && (
                <div className="absolute left-0 w-full mt-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.label}
                      onClick={() => {
                        navigate(subItem.path);
                        if (window.innerWidth < 1024) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <subItem.icon className="w-4 h-4" />
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "ml-0"}`}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Profile
              </button>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;