
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define a simplified type for repayments
interface Repayment {
  repayment_id: string;
  amount: number;
  payment_date: string | null;
  status: string;
  created_at: string | null;
}

// Mock data for repayments
const mockRepayments: Repayment[] = [
  {
    repayment_id: "REP001",
    amount: 250.00,
    payment_date: "2023-10-15T00:00:00Z",
    status: "paid",
    created_at: "2023-09-15T10:30:00Z"
  },
  {
    repayment_id: "REP002",
    amount: 250.00,
    payment_date: "2023-11-15T00:00:00Z",
    status: "pending",
    created_at: null
  },
  {
    repayment_id: "REP003",
    amount: 250.00,
    payment_date: "2023-12-15T00:00:00Z",
    status: "overdue",
    created_at: null
  }
];

const ClientRepayments = () => {
  const { user } = useAuth();
  
  // Use mock data instead of fetching from Supabase
  const repayments = mockRepayments;
  const isLoading = false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Repayments</h1>
      
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repayment ID</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repayments && repayments.length > 0 ? (
              repayments.map((repayment) => (
                <TableRow key={repayment.repayment_id}>
                  <TableCell>{repayment.repayment_id}</TableCell>
                  <TableCell>{repayment.payment_date ? new Date(repayment.payment_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>${repayment.amount.toFixed(2)}</TableCell>
                  <TableCell>{repayment.status}</TableCell>
                  <TableCell>{repayment.created_at ? new Date(repayment.created_at).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No repayments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ClientRepayments;
