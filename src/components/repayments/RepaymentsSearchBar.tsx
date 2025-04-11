
import React, { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface RepaymentsSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalCount?: number;
  filteredCount?: number;
}

const RepaymentsSearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  totalCount, 
  filteredCount 
}: RepaymentsSearchBarProps) => {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="relative space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search repayments by date, borrower name, or amount..." 
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-8"
        />
      </div>
      
      {searchQuery && totalCount !== undefined && filteredCount !== undefined && (
        <p className="text-sm text-gray-500">
          Showing {filteredCount} of {totalCount} repayments
        </p>
      )}
    </div>
  );
};

export default RepaymentsSearchBar;
