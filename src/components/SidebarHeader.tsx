
import React from 'react';

interface SidebarHeaderProps {
  isOpen: boolean;
}

const SidebarHeader = ({ isOpen }: SidebarHeaderProps) => {
  return (
    <div
      className="flex items-center justify-start py-0.1 px-2.0"
    >
      <img
        src="/K_R_Logo-1-removebg-preview.png"
        alt="K&R Logo"
        className={`transition-all duration-300 object-contain ml-4 ${
          isOpen ? 'w-48 h-auto' : 'w-20 h-auto'
        }`}
      />
    </div>
  );
};

export default SidebarHeader;
