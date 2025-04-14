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
import { useQuery } from "@tanstack/react-query";

const ClientRepayments = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: repayments, isLoading } = useQuery({
    queryKey: ['client-repayments', user?.user_id],
    queryFn: async () => {
      // First get the borrower_id from user_profiles
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('borrower_id')
        .eq('user_id', user?.user_id)
        .single();

      if (!userProfile?.borrower_id) {
        throw new Error('Borrower ID not found');
      }

      // Get loans for this borrower
      const { data: loans } = await supabase
        .from('loans')
        .select('loan_id')
        .eq('borrower_id', userProfile.borrower_id);

      if (!loans?.length) {
        return [];
      }

      const loanIds = loans.map(loan => loan.loan_id);

      // Get repayments for these loans
      const { data, error } = await supabase
        .from('repayments')
        .select('*')
        .in('loan_id', loanIds)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      
      if (!data) return [];
      
      // Map database fields to our Repayment type
      return data.map(item => ({
        repayment_id: item.repayment_id,
        payment_date: item.payment_date,
        amount: Number(item.amount),
        loan_id: item.loan_id,
        borrowerName: 'Client',
        status: item.status as any,
        receipt_url: item.receipt_url,
        notes: item.notes,
        source: item.source,
        verification_status: item.verification_status,
        verified_at: item.verified_at,
        verified_by: item.verified_by
      }));
    },
    enabled: !!user?.user_id
  });

  // Filter repayments based on search query
  const filteredRepayments = useMemo(() => {
    if (!repayments || !searchQuery.trim()) return repayments || [];
    
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
