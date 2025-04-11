
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
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
import RepaymentsSearchBar from "@/components/repayments/RepaymentsSearchBar";

const ClientRepayments = () => {
  const { user } = useAuth();
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
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
          repayment_id: item.repayment_id || `temp-${Date.now()}`,
          payment_date: item.payment_date || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          amount: Number(item.amount),
          loan_id: item.loan_id || 'Unknown',
          borrowerName: 'Client', // Default for client view
          status: item.status as any || "pending",
          receipt_url: item.receipt_url || undefined,
          notes: item.notes || undefined,
          source: item.source,
          verification_status: item.verification_status,
          verified_at: item.verified_at,
          verified_by: item.verified_by
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

  // Filter repayments based on search query
  const filteredRepayments = useMemo(() => {
    if (!searchQuery.trim()) return repayments;
    
    const query = searchQuery.toLowerCase().trim();
    return repayments.filter(repayment => {
      const date = new Date(repayment.payment_date).toLocaleDateString().toLowerCase();
      const amount = repayment.amount.toString();
      const repaymentId = repayment.repayment_id.toLowerCase();
      const loanId = repayment.loan_id.toLowerCase();
      const status = repayment.status.toLowerCase();
      
      return (
        date.includes(query) ||
        amount.includes(query) ||
        repaymentId.includes(query) ||
        loanId.includes(query) ||
        status.includes(query)
      );
    });
  }, [repayments, searchQuery]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Repayments</h1>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <RepaymentsSearchBar 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery}
              totalCount={repayments.length}
              filteredCount={filteredRepayments.length}
            />
            
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
                ) : filteredRepayments.length > 0 ? (
                  filteredRepayments.map((repayment) => (
                    <TableRow key={repayment.repayment_id}>
                      <TableCell>{repayment.repayment_id}</TableCell>
                      <TableCell>{new Date(repayment.payment_date).toLocaleDateString()}</TableCell>
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
                      <TableCell>{new Date(repayment.payment_date).toLocaleDateString()}</TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientRepayments;
