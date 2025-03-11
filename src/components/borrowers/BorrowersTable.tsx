
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  return (
    <div className="space-y-4">
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
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Occupation</TableHead>
            <TableHead>Active Loan ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {borrowers.map((borrower) => (
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
              <TableCell>{borrower.activeLoanId || 'No active loan'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BorrowersTable;
