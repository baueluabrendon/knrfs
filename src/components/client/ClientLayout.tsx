
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
  const { signOut, user } = useAuth();
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
        className={`bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-between items-center bg-gradient-to-r from-green-600 to-green-700 border-b border-gray-200">
            <div className={`text-center flex-1 ${isSidebarOpen ? "block" : "hidden"}`}>
              <h1 className="font-bold text-white text-lg">Client Portal</h1>
              <p className="text-green-100 text-xs mt-1">K&R Financial Services</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white hover:bg-white/10 flex-shrink-0"
            >
              {isSidebarOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-green-50 text-green-700 border-l-4 border-green-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className={`mr-3 h-4 w-4 ${
                  isActive(item.path) ? "text-green-600" : "text-gray-500"
                }`} />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </Button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors duration-200"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              {isSidebarOpen && <span className="font-medium">Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold text-gray-800">Welcome to K&R Financial Services</h1>
            <p className="text-sm text-gray-600 mt-1">Hello, {user?.first_name || "Client"} - Manage your loans and applications</p>
          </div>
        </div>
        <div className="p-6 bg-gray-50 min-h-full">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientLayout;
