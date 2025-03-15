
import React, { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col">
        <header className="bg-white shadow">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">Client Portal</h1>
          </div>
        </header>
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-white border-t">
          <div className="container mx-auto px-6 py-4 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Loan Management System. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ClientLayout;
