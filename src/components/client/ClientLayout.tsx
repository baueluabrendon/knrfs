
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`bg-white shadow-lg border-r border-gray-200 ${
          isSidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className={`font-bold text-xl text-gray-900 ${isSidebarOpen ? "block" : "hidden"}`}>
                Client Portal
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-600 hover:bg-gray-100"
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </Button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {isSidebarOpen && <span className="font-medium">Sign Out</span>}
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
