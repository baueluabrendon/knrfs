
import { LucideIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SubItem {
  icon: LucideIcon;
  label: string;
  path: string;
  onClick?: () => void;
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
  const location = useLocation();
  
  const isActive = location.pathname === path || subItems.some(sub => location.pathname === sub.path);

  const handleClick = (navigationPath: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    } else if (navigationPath !== "#") {
      navigate(navigationPath);
      if (window.innerWidth < 1024) {
        onCloseSidebar();
      }
    }
  };

  return (
    <div className="mb-1">
      <button
        onClick={() => handleClick(path)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`
          flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
          ${isActive 
            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm" 
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }
        `}
      >
        <ItemIcon className={`w-5 h-5 mr-3 ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}`} />
        <span className="font-medium">{label}</span>
        {subItems.length > 0 && (
          <div className={`ml-auto transform transition-transform duration-200 ${isHovered ? "rotate-90" : ""}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </button>
      
      {subItems.length > 0 && isHovered && (
        <div className="mt-1 ml-4 space-y-1 bg-gray-50 rounded-lg p-2 border-l-2 border-gray-200">
          {subItems.map((subItem) => {
            const SubIcon = subItem.icon;
            const isSubActive = location.pathname === subItem.path;
            
            return (
              <button
                key={subItem.label}
                onClick={() => handleClick(subItem.path, subItem.onClick)}
                className={`
                  w-full px-3 py-2 text-left text-sm rounded-md flex items-center gap-3 transition-colors duration-200
                  ${isSubActive 
                    ? "bg-blue-100 text-blue-700 font-medium" 
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                  }
                `}
              >
                <SubIcon className={`w-4 h-4 ${isSubActive ? "text-blue-600" : "text-gray-500"}`} />
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
