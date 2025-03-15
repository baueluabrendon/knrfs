
import React, { useState, ReactNode } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  X,
  FileSignature,
  Clock,
  Wallet,
  User,
  HelpCircle,
} from "lucide-react";

interface ClientLayoutProps {
  children: ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/client",
    },
    {
      icon: FileSignature,
      label: "Apply for a New Loan",
      path: "/apply",
    },
    {
      icon: Clock,
      label: "Application Status",
      path: "/client/applications",
    },
    {
      icon: Wallet,
      label: "Repayments",
      path: "/client/repayments",
    },
    {
      icon: FileText,
      label: "My Loans",
      path: "/client/loans",
    },
    {
      icon: User,
      label: "Profile",
      path: "/client/profile",
    },
    {
      icon: HelpCircle,
      label: "Support",
      path: "/client/support",
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-[#32CD32] text-white ${
          isSidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-between items-center">
            <h1 className={`font-bold ${isSidebarOpen ? "block" : "hidden"}`}>
              Client Portal
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white hover:bg-white/10"
            >
              {isSidebarOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-white/10"
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {isSidebarOpen && item.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isSidebarOpen && "Sign Out"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="bg-[#FFD700] p-4">
          <h1 className="text-xl font-bold">Welcome to K&R Financial Services</h1>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ClientLayout;
