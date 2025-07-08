
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
  
  const isActive = location.pathname === path || 
    subItems.some(subItem => location.pathname === subItem.path);

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

  const handleMouseEnter = () => {
    onMouseEnter();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Only hide dropdown if mouse is not moving to the dropdown area
    const rect = e.currentTarget.getBoundingClientRect();
    const isMovingToDropdown = e.clientX > rect.right;
    
    if (!isMovingToDropdown) {
      onMouseLeave();
    }
  };

  const handleDropdownMouseLeave = (e: React.MouseEvent) => {
    // Only hide dropdown if mouse is leaving the entire menu area
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeavingDropdown = e.clientX < rect.left || e.clientX > rect.right || 
                             e.clientY < rect.top || e.clientY > rect.bottom;
    
    if (isLeavingDropdown) {
      onMouseLeave();
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => handleClick(path)}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
          isActive 
            ? "bg-green-50 text-green-700 border-l-4 border-green-600 shadow-sm" 
            : isHovered 
              ? "bg-gray-50 text-gray-700 shadow-sm" 
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-700"
        }`}
      >
        <ItemIcon className={`w-5 h-5 mr-3 transition-colors duration-200 ${
          isActive ? "text-green-600" : "text-gray-500 group-hover:text-gray-600"
        }`} />
        <span className="font-medium">{label}</span>
        {subItems.length > 0 && (
          <svg 
            className={`w-4 h-4 ml-auto transition-transform duration-200 ${
              isHovered ? "rotate-90" : ""
            }`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      {subItems.length > 0 && isHovered && (
        <div 
          className="absolute left-full top-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
          style={{ 
            pointerEvents: 'auto',
            marginLeft: '4px'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          {subItems.map((subItem) => {
            const SubIcon = subItem.icon;
            const isSubActive = location.pathname === subItem.path;
            return (
              <button
                key={subItem.label}
                onClick={() => handleClick(subItem.path, subItem.onClick)}
                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors duration-200 ${
                  isSubActive 
                    ? "bg-green-50 text-green-700 border-r-4 border-green-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <SubIcon className={`w-4 h-4 ${
                  isSubActive ? "text-green-600" : "text-gray-500"
                }`} />
                <span className="font-medium">{subItem.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarMenuItem;
