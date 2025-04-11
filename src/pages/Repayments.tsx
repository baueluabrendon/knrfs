
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import RepaymentDialog from "@/components/repayments/RepaymentDialog";
import RepaymentsTable from "@/components/repayments/RepaymentsTable";
import RepaymentsSearchBar from "@/components/repayments/RepaymentsSearchBar";
import { supabase } from "@/integrations/supabase/client";
import { Repayment } from "@/types/repayment";
import { toast } from "sonner";

const Repayments = () => {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRepayments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('repayments')
        .select('*');
      
      if (error) {
        console.error('Error fetching repayments:', error);
        toast.error("Failed to fetch repayments");
        throw error;
      }
      
      if (!data || data.length === 0) {
        setRepayments([]);
        setIsLoading(false);
        return;
      }
      
      let mappedRepayments: Repayment[] = data.map(item => ({
        repayment_id: item.repayment_id || `temp-${Date.now()}`,
        payment_date: item.payment_date || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        amount: Number(item.amount),
        loan_id: item.loan_id || 'Unknown',
        borrowerName: 'Loading...',
        status: item.status as any || "pending",
        receipt_url: item.receipt_url || undefined,
        notes: item.notes || undefined,
        source: item.source,
        verification_status: item.verification_status,
        verified_at: item.verified_at,
        verified_by: item.verified_by
      }));
      
      for (let i = 0; i < mappedRepayments.length; i++) {
        if (mappedRepayments[i].loan_id && mappedRepayments[i].loan_id !== 'Unknown') {
          try {
            const { data: loanData, error: loanError } = await supabase
              .from('loans')
              .select('borrower_id')
              .eq('loan_id', mappedRepayments[i].loan_id)
              .single();
            
            if (loanError || !loanData) {
              console.error('Error fetching loan for repayment:', loanError);
              continue;
            }
            
            const { data: borrowerData, error: borrowerError } = await supabase
              .from('borrowers')
              .select('given_name, surname')
              .eq('borrower_id', loanData.borrower_id)
              .single();
            
            if (borrowerError || !borrowerData) {
              console.error('Error fetching borrower for loan:', borrowerError);
              continue;
            }
            
            mappedRepayments[i].borrowerName = `${borrowerData.given_name} ${borrowerData.surname}`;
          } catch (err) {
            console.error('Error in borrower name fetch loop:', err);
            // Keep the "Loading..." label on error
          }
        }
      }
      
      setRepayments(mappedRepayments);
    } catch (error) {
      console.error('Error in fetchRepayments:', error);
      toast.error("Failed to load repayments data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepayments();
  }, []);

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      fetchRepayments();
    }
  };

  // Filter repayments based on search query
  const filteredRepayments = useMemo(() => {
    if (!searchQuery.trim()) return repayments;
    
    const query = searchQuery.toLowerCase().trim();
    return repayments.filter(repayment => {
      const date = new Date(repayment.payment_date).toLocaleDateString().toLowerCase();
      const amount = repayment.amount.toString();
      const borrowerName = repayment.borrowerName.toLowerCase();
      const loanId = repayment.loan_id.toLowerCase();
      const status = repayment.status.toLowerCase();
      
      return (
        date.includes(query) ||
        amount.includes(query) ||
        borrowerName.includes(query) ||
        loanId.includes(query) ||
        status.includes(query)
      );
    });
  }, [repayments, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Repayments Management</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/repayments/bulk">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Repayment Upload
            </Link>
          </Button>
          <RepaymentDialog 
            isOpen={isDialogOpen} 
            onOpenChange={handleDialogOpenChange} 
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <RepaymentsSearchBar 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery}
              totalCount={repayments.length}
              filteredCount={filteredRepayments.length}
            />
            
            {isLoading ? (
              <div className="text-center py-8">Loading repayments...</div>
            ) : (
              <RepaymentsTable repayments={filteredRepayments} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Repayments;
