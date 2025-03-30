
import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  totalCount: number;
  filteredCount: number;
}

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  totalCount, 
  filteredCount 
}: SearchBarProps) => {
  return (
    <div className="flex items-center mb-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search by name or loan ID..."
          value={searchQuery}
          onChange={onSearchChange}
          className="pl-9 pr-4"
        />
      </div>
      <div className="ml-2">
        {searchQuery && (
          <p className="text-sm text-gray-500">
            Showing {filteredCount} of {totalCount} loans
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
