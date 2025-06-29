
import React from 'react';
import SidebarMenuItem from './SidebarMenuItem';
import { LucideIcon } from 'lucide-react';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  subItems: {
    icon: LucideIcon;
    label: string;
    path: string;
  }[];
}

interface SidebarNavProps {
  menuItems: MenuItem[];
  hoveredItem: string | null;
  setHoveredItem: (item: string | null) => void;
  onCloseSidebar: () => void;
}

const SidebarNav = ({ menuItems, hoveredItem, setHoveredItem, onCloseSidebar }: SidebarNavProps) => {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 bg-white">
      {menuItems.map((item) => (
        <SidebarMenuItem
          key={item.label}
          {...item}
          isHovered={hoveredItem === item.label}
          onMouseEnter={() => setHoveredItem(item.label)}
          onMouseLeave={() => setHoveredItem(null)}
          onCloseSidebar={onCloseSidebar}
        />
      ))}
    </nav>
  );
};

export default SidebarNav;
