import { useState } from "react";
import { toast } from "sonner";
import SidebarNav from "./SidebarNav";
import DashboardHeader from "./DashboardHeader";
import SidebarHeader from "./SidebarHeader";
import BorrowerDialog from "./borrowers/BorrowerDialog";
import { menuItems as defaultMenuItems } from "@/config/menuItems";
import { BorrowerFormData } from "./borrowers/BorrowerForm";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showAddBorrower, setShowAddBorrower] = useState(false);

  const handleAddBorrower = (formData: BorrowerFormData) => {
    console.log('New borrower data:', formData);
    setShowAddBorrower(false);
    toast.success("Borrower added successfully");
  };

  const menuItems = defaultMenuItems.map(item => {
    if (item.label === "Borrowers") {
      return {
        ...item,
        subItems: item.subItems.map(subItem => 
          subItem.label === "Add Borrower" 
            ? { ...subItem, onClick: () => setShowAddBorrower(true) }
            : subItem
        )
      };
    }
    return item;
  });

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={`bg-primary border-r border-gray-200 ${
          isSidebarOpen ? "w-64" : "w-16"
        } transition-[width] duration-200`}
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

      <div className="flex-1">
        <DashboardHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-6 bg-background">
          {children}
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