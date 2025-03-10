
import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";

// Define a simplified type for repayments
interface Repayment {
  repayment_id: string;
  amount: number;
  payment_date: string | null;
  status: string;
  created_at: string | null;
  receipt_url: string | null;
}

const ClientRepayments = () => {
  const { user } = useAuth();
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchRepayments = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // In a real application, you would filter by user ID or associated loans
        const { data, error } = await supabase
          .from('repayments')
          .select('*');
        
        if (error) {
          console.error('Error fetching repayments:', error);
        } else {
          setRepayments(data as Repayment[]);
        }
      } catch (error) {
        console.error('Error in fetchRepayments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRepayments();
  }, [user]);

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
              <TableHead>Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading repayments...
                </TableCell>
              </TableRow>
            ) : repayments && repayments.length > 0 ? (
              repayments.map((repayment) => (
                <TableRow key={repayment.repayment_id}>
                  <TableCell>{repayment.repayment_id}</TableCell>
                  <TableCell>{repayment.payment_date ? new Date(repayment.payment_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>${repayment.amount.toFixed(2)}</TableCell>
                  <TableCell>{repayment.status}</TableCell>
                  <TableCell>{repayment.created_at ? new Date(repayment.created_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    {repayment.receipt_url && (
                      <a 
                        href={repayment.receipt_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
