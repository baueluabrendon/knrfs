
import { ReactNode, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import SidebarNav from "./SidebarNav";
import DashboardHeader from "./DashboardHeader";
import SidebarHeader from "./SidebarHeader";
import BorrowerDialog from "./borrowers/BorrowerDialog";
import { menuItems as defaultMenuItems } from "@/config/menuItems";
import { BorrowerFormData, BorrowerInsertData } from "./borrowers/BorrowerForm";
import { supabase } from "@/lib/supabase";

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showAddBorrower, setShowAddBorrower] = useState(false);
  const location = useLocation();

  useEffect(() => {
    console.log("Current Route:", location.pathname);
  }, [location.pathname]);

  const handleAddBorrower = async (formData: BorrowerFormData) => {
    try {
      // Insert the borrower data without borrower_id
      // The database trigger will generate it
      const { data, error } = await supabase
        .from('borrowers')
        .insert([formData as unknown as BorrowerInsertData])
        .select();
      
      if (error) {
        toast.error('Failed to add borrower: ' + error.message);
        return;
      }
      
      setShowAddBorrower(false);
      toast.success("Borrower added successfully");
    } catch (error) {
      console.error('Error adding borrower:', error);
      toast.error('Failed to add borrower');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // No need to modify menuItems since we removed the subItems from config

  return (
    <div className="flex h-screen">
      <aside
        className={`bg-primary border-r border-gray-200 transition-all duration-200 ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader isOpen={isSidebarOpen} />
          <SidebarNav
            menuItems={defaultMenuItems}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            onCloseSidebar={() => setIsSidebarOpen(false)}
          />
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-4 min-w-0 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>

      <BorrowerDialog
        open={showAddBorrower}
        onOpenChange={setShowAddBorrower}
        onSubmit={handleAddBorrower}
      />
    </div>
  );
};

export default DashboardLayout;
