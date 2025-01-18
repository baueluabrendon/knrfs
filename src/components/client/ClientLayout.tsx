import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const ClientLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-primary text-white ${
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
              className="text-white hover:bg-primary-foreground/10"
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
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-primary-foreground/10"
                  onClick={() => navigate("/client")}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {isSidebarOpen && "Dashboard"}
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-primary-foreground/10"
                  onClick={() => navigate("/client/loans")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {isSidebarOpen && "My Loans"}
                </Button>
              </li>
            </ul>
          </nav>

          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-primary-foreground/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isSidebarOpen && "Sign Out"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;