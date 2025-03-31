
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  organization: string;
  monthlyIncome: number;
  activeLoanId: string | null;
  fileNumber: string | null;
}

interface BorrowersTableProps {
  borrowers: Borrower[];
  onBorrowerClick: (borrower: Borrower) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const BorrowersTable = ({ 
  borrowers, 
  onBorrowerClick, 
  searchQuery = "", 
  onSearchChange 
}: BorrowersTableProps) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [filteredBorrowers, setFilteredBorrowers] = useState<Borrower[]>(borrowers);
  const [totalCount, setTotalCount] = useState(borrowers.length);
  const [filteredCount, setFilteredCount] = useState(borrowers.length);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (borrowers) {
      setTotalCount(borrowers.length);
      
      // Apply search filtering
      if (localSearchQuery.trim() === "") {
        setFilteredBorrowers(borrowers);
        setFilteredCount(borrowers.length);
      } else {
        const lowercaseQuery = localSearchQuery.toLowerCase();
        const filtered = borrowers.filter(
          borrower =>
            borrower.name.toLowerCase().includes(lowercaseQuery) ||
            borrower.email.toLowerCase().includes(lowercaseQuery) ||
            borrower.id.toLowerCase().includes(lowercaseQuery) ||
            (borrower.phone && borrower.phone.toLowerCase().includes(lowercaseQuery)) ||
            (borrower.organization && borrower.organization.toLowerCase().includes(lowercaseQuery)) ||
            (borrower.fileNumber && borrower.fileNumber.toLowerCase().includes(lowercaseQuery))
        );
        setFilteredBorrowers(filtered);
        setFilteredCount(filtered.length);
      }
    }
  }, [localSearchQuery, borrowers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-white pt-4 pb-2 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search borrowers by name, email, or ID..." 
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
        
        {localSearchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {filteredCount} of {totalCount} borrowers
          </p>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-[72px] z-10 bg-white">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Occupation</TableHead>
              <TableHead>File Number</TableHead>
              <TableHead>Active Loan ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBorrowers.map((borrower) => (
              <TableRow key={borrower.id}>
                <TableCell>
                  <button 
                    className="text-blue-600 hover:underline"
                    onClick={() => onBorrowerClick(borrower)}
                  >
                    {borrower.id}
                  </button>
                </TableCell>
                <TableCell>
                  <button 
                    className="text-blue-600 hover:underline"
                    onClick={() => onBorrowerClick(borrower)}
                  >
                    {borrower.name}
                  </button>
                </TableCell>
                <TableCell>{borrower.email}</TableCell>
                <TableCell>{borrower.phone}</TableCell>
                <TableCell>{borrower.organization}</TableCell>
                <TableCell>{borrower.occupation}</TableCell>
                <TableCell>{borrower.fileNumber || 'N/A'}</TableCell>
                <TableCell>{borrower.activeLoanId || 'No active loan'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BorrowersTable;
