import { Menu } from "lucide-react";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

const DashboardHeader = ({ onToggleSidebar }: DashboardHeaderProps) => {
  return (
    <header className="bg-accent border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center px-4 py-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-accent/80"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;