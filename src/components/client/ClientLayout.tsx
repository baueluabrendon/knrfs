
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
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-amber-50">
      <aside
        className={`bg-white shadow-xl border-r border-yellow-200 ${
          isSidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-yellow-200 bg-gradient-to-r from-green-800 to-green-900">
            <div className="flex items-center justify-between">
              <div className={`${isSidebarOpen ? "block" : "hidden"} transition-opacity duration-300`}>
                <h1 className="font-bold text-xl text-yellow-400">
                  Client Portal
                </h1>
                <p className="text-yellow-200 text-sm font-medium">
                  K&R Financial Services
                </p>
              </div>
              {!isSidebarOpen && (
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-green-800 font-bold text-lg">C</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-yellow-400 hover:bg-green-700 ml-auto"
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 bg-gradient-to-b from-yellow-50 to-yellow-100">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={`
                  w-full justify-start font-medium transition-all duration-200 h-12 px-4
                  ${isActive(item.path)
                    ? "bg-yellow-400 text-green-900 border-l-4 border-green-800 shadow-md font-semibold hover:bg-yellow-400"
                    : "text-amber-900 hover:bg-yellow-100 hover:text-green-800"
                  }
                `}
                onClick={() => navigate(item.path)}
              >
                <item.icon className={`h-5 w-5 ${isSidebarOpen ? "mr-3" : ""} ${
                  isActive(item.path) ? "text-green-800" : "text-amber-700"
                }`} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>

          <div className="p-4 border-t border-yellow-200 bg-yellow-50">
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
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-md border-b border-yellow-600 p-6">
          <h1 className="text-2xl font-bold text-green-900">K&R Financial Services</h1>
          <p className="text-green-700 mt-1 font-medium">Professional Financial Solutions</p>
        </div>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientLayout;
