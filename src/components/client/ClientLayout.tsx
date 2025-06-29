
import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

const ClientLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
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
      path: "/client/apply",
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`bg-white shadow-lg border-r border-gray-200 ${
          isSidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between">
              <div className={`${isSidebarOpen ? "block" : "hidden"} transition-opacity duration-300`}>
                <h1 className="font-bold text-xl text-white">
                  Client Portal
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  K&R Financial Services
                </p>
              </div>
              {!isSidebarOpen && (
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold text-lg">C</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white hover:bg-blue-500/20 ml-auto"
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={`
                  w-full justify-start font-medium transition-all duration-200 h-12 px-4
                  ${isActive(item.path)
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm hover:bg-blue-50"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
                onClick={() => navigate(item.path)}
              >
                <item.icon className={`h-5 w-5 ${isSidebarOpen ? "mr-3" : ""} ${
                  isActive(item.path) ? "text-blue-600" : "text-gray-500"
                }`} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 h-12 px-4 font-medium"
              onClick={handleSignOut}
            >
              <LogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-3" : ""}`} />
              {isSidebarOpen && <span>Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="bg-white shadow-sm border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">K&R Financial Services</h1>
          <p className="text-gray-600 mt-1">Professional Financial Solutions</p>
        </div>
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ClientLayout;
