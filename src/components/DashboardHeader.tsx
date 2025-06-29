
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

const DashboardHeader = ({ onToggleSidebar }: DashboardHeaderProps) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Successfully logged out");
    } catch (error) {
      toast.error("Failed to log out");
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-b border-yellow-600 sticky top-0 z-30 shadow-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-yellow-300 transition-colors duration-200"
          >
            <Menu className="w-5 h-5 text-green-800" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-green-900">Dashboard</h1>
            <p className="text-sm text-green-700">K&R Financial Services</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-green-800 hover:bg-yellow-300 hover:text-green-900 font-medium"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
