
import { LucideIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

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
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  
  const isActive = location.pathname === path || subItems.some(sub => location.pathname === sub.path);
  const showDropdown = isHovered || isDropdownHovered;

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

  const handleMainItemMouseLeave = () => {
    // Delay hiding to allow moving to dropdown
    setTimeout(() => {
      if (!isDropdownHovered) {
        onMouseLeave();
      }
    }, 100);
  };

  return (
    <div className="mb-1 relative">
      <button
        onClick={() => handleClick(path)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={handleMainItemMouseLeave}
        className={`
          flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
          ${isActive 
            ? "bg-yellow-400 text-green-900 border-l-4 border-green-800 shadow-md font-semibold" 
            : "text-amber-900 hover:bg-yellow-100 hover:text-green-800"
          }
        `}
      >
        <ItemIcon className={`w-5 h-5 mr-3 ${isActive ? "text-green-800" : "text-amber-700 group-hover:text-green-700"}`} />
        <span className="font-medium">{label}</span>
        {subItems.length > 0 && (
          <div className={`ml-auto transform transition-transform duration-200 ${showDropdown ? "rotate-90" : ""}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </button>
      
      {subItems.length > 0 && showDropdown && (
        <div 
          className="absolute top-0 left-full ml-2 w-56 bg-white rounded-lg shadow-xl border border-yellow-200 p-2 z-50"
          onMouseEnter={() => setIsDropdownHovered(true)}
          onMouseLeave={() => {
            setIsDropdownHovered(false);
            onMouseLeave();
          }}
        >
          <div className="space-y-1">
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
                      ? "bg-yellow-400 text-green-900 font-semibold shadow-sm" 
                      : "text-amber-800 hover:bg-yellow-50 hover:text-green-800"
                    }
                  `}
                >
                  <SubIcon className={`w-4 h-4 ${isSubActive ? "text-green-800" : "text-amber-600"}`} />
                  <span>{subItem.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarMenuItem;
