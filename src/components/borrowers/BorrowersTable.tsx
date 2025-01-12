import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  monthlyIncome: number;
  activeLoanId: string | null;
}

interface BorrowersTableProps {
  borrowers: Borrower[];
  onBorrowerClick: (borrower: Borrower) => void;
}

const BorrowersTable = ({ borrowers, onBorrowerClick }: BorrowersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Occupation</TableHead>
          <TableHead>Monthly Income</TableHead>
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
            <TableCell>{borrower.address}</TableCell>
            <TableCell>{borrower.occupation}</TableCell>
            <TableCell>${borrower.monthlyIncome.toLocaleString()}</TableCell>
            <TableCell>{borrower.activeLoanId || 'No active loan'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BorrowersTable;