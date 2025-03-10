
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
import { Repayment } from "@/types/repayment";

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
          // Map database fields to our Repayment type
          const mappedRepayments: Repayment[] = data.map(item => ({
            id: item.repayment_id,
            date: item.payment_date || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            amount: Number(item.amount),
            loanId: item.loan_id || 'Unknown',
            borrowerName: 'Client', // Default for client view
            status: item.status as "pending" | "completed" | "failed" || "pending",
            payPeriod: "Current", // Default value
            receiptUrl: item.receipt_url || undefined
          }));
          
          setRepayments(mappedRepayments);
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
                <TableRow key={repayment.id}>
                  <TableCell>{repayment.id}</TableCell>
                  <TableCell>{new Date(repayment.date).toLocaleDateString()}</TableCell>
                  <TableCell>${repayment.amount.toFixed(2)}</TableCell>
                  <TableCell>{repayment.status}</TableCell>
                  <TableCell>{new Date(repayment.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {repayment.receiptUrl && (
                      <a 
                        href={repayment.receiptUrl} 
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
