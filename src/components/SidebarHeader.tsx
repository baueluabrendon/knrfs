
import React from 'react';

interface SidebarHeaderProps {
  isOpen: boolean;
}

const SidebarHeader = ({ isOpen }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className={`transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
        <h1 className="text-xl font-bold text-white">
          K&R Financial
        </h1>
        <p className="text-blue-100 text-sm font-medium">
          Services
        </p>
      </div>
      {!isOpen && (
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-bold text-lg">K</span>
        </div>
      )}
    </div>
  );
};

export default SidebarHeader;
