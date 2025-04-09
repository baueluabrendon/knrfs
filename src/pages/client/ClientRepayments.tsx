
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
import { supabase } from "@/integrations/supabase/client";
import { Repayment } from "@/types/repayment";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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
          throw error;
        }
        
        if (!data || data.length === 0) {
          setRepayments([]);
          return;
        }
        
        // Map database fields to our Repayment type
        const mappedRepayments: Repayment[] = data.map(item => ({
          id: item.repayment_id,
          date: item.payment_date || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          amount: Number(item.amount),
          loanId: item.loan_id || 'Unknown',
          borrowerName: 'Client', // Default for client view
          status: item.status as any || "pending",
          payPeriod: "Current", // Default value
          receiptUrl: item.receipt_url || undefined,
          notes: item.notes || undefined
        }));
        
        setRepayments(mappedRepayments);
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
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading repayments...
                </TableCell>
              </TableRow>
            ) : repayments && repayments.length > 0 ? (
              repayments.map((repayment) => (
                <TableRow key={repayment.id}>
                  <TableCell>{repayment.id}</TableCell>
                  <TableCell>{new Date(repayment.date).toLocaleDateString()}</TableCell>
                  <TableCell>${repayment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                      ${repayment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        repayment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        repayment.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        repayment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-red-100 text-red-800'}`}>
                      {repayment.status.charAt(0).toUpperCase() + repayment.status.slice(1)}
                    </span>
                  </TableCell>
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
                  <TableCell>
                    {repayment.notes ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{repayment.notes}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
