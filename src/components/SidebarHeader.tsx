
import React from 'react';

interface SidebarHeaderProps {
  isOpen: boolean;
}

const SidebarHeader = ({ isOpen }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
      <div className="text-center">
        <h1 className={`font-bold text-white transition-all duration-300 ${
          isOpen ? "text-lg opacity-100" : "text-sm opacity-90"
        }`}>
          {isOpen ? "K&R Financial Services" : "K&R"}
        </h1>
        {isOpen && (
          <p className="text-green-100 text-xs mt-1 font-medium">
            Professional Lending Solutions
          </p>
        )}
      </div>
    </div>
  );
};

export default SidebarHeader;
