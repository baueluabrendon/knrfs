import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface SidebarMenuItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  subItems: SubItem[];
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onCloseSidebar: () => void;
}

const SidebarMenuItem = ({
  icon: ItemIcon,
  label,
  path,
  subItems,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onCloseSidebar,
}: SidebarMenuItemProps) => {
  const navigate = useNavigate();

  const handleClick = (navigationPath: string) => {
    navigate(navigationPath);
    if (window.innerWidth < 1024) {
      onCloseSidebar();
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        onClick={() => handleClick(path)}
        className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          isHovered ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <ItemIcon className="w-5 h-5 mr-3" />
        <span>{label}</span>
      </button>
      
      {subItems.length > 0 && isHovered && (
        <div className="w-full bg-white py-1 mt-1">
          {subItems.map((subItem) => {
            const SubIcon = subItem.icon;
            return (
              <button
                key={subItem.label}
                onClick={() => handleClick(subItem.path)}
                className="w-full px-8 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <SubIcon className="w-4 h-4" />
                <span>{subItem.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarMenuItem;