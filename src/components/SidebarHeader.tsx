
import React from 'react';

interface SidebarHeaderProps {
  isOpen: boolean;
}

const SidebarHeader = ({ isOpen }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-yellow-200 bg-gradient-to-r from-green-800 to-green-900">
      <div className={`transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
        <h1 className="text-xl font-bold text-yellow-400">
          K&R Financial
        </h1>
        <p className="text-yellow-200 text-sm font-medium">
          Services
        </p>
      </div>
      {!isOpen && (
        <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
          <span className="text-green-800 font-bold text-lg">K</span>
        </div>
      )}
    </div>
  );
};

export default SidebarHeader;
