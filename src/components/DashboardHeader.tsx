import { Menu } from "lucide-react";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

const DashboardHeader = ({ onToggleSidebar }: DashboardHeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-4">
          <button className="text-sm text-gray-600 hover:text-gray-900">
            Profile
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;