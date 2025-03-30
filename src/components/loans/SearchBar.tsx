
import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalCount?: number;
  filteredCount?: number;
}

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  totalCount, 
  filteredCount 
}: SearchBarProps) => {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="relative space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search loans by name, ID or status..." 
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-8"
        />
      </div>
      
      {searchQuery && totalCount !== undefined && filteredCount !== undefined && (
        <p className="text-sm text-gray-500">
          Showing {filteredCount} of {totalCount} loans
        </p>
      )}
    </div>
  );
};

export default SearchBar;
