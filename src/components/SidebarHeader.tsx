import React from 'react';

interface SidebarHeaderProps {
  isOpen: boolean;
}

const SidebarHeader = ({ isOpen }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-primary">
      <h1 className={`text-xl font-semibold text-white transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}>
        K&R Financial Services
      </h1>
    </div>
  );
};

export default SidebarHeader;