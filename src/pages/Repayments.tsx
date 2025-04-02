
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import RepaymentDialog from "@/components/repayments/RepaymentDialog";
import RepaymentsTable from "@/components/repayments/RepaymentsTable";
import { supabase } from "@/integrations/supabase/client";
import { Repayment } from "@/types/repayment";

const Repayments = () => {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRepayments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('repayments')
        .select('*');
      
      if (error) {
        console.error('Error fetching repayments:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        setRepayments([]);
        setIsLoading(false);
        return;
      }
      
      // First, initialize the mapped repayments with placeholder borrower names
      let mappedRepayments: Repayment[] = data.map(item => ({
        id: item.repayment_id,
        date: item.payment_date || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        amount: Number(item.amount),
        loanId: item.loan_id || 'Unknown',
        borrowerName: 'Loading...', // Placeholder, will be updated
        status: item.status as any || "pending",
        payPeriod: "Current", // Default value
        receiptUrl: item.receipt_url || undefined,
        notes: item.notes || undefined
      }));
      
      // Then, fetch borrower names for each repayment
      for (let i = 0; i < mappedRepayments.length; i++) {
        if (mappedRepayments[i].loanId && mappedRepayments[i].loanId !== 'Unknown') {
          try {
            const { data: loanData, error: loanError } = await supabase
              .from('loans')
              .select('borrower_id')
              .eq('loan_id', mappedRepayments[i].loanId)
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
          }
        }
      }
      
      setRepayments(mappedRepayments);
    } catch (error) {
      console.error('Error in fetchRepayments:', error);
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
      // Refresh repayments when dialog is closed
      fetchRepayments();
    }
  };

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

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center py-8">Loading repayments...</div>
        ) : (
          <RepaymentsTable repayments={repayments} />
        )}
      </Card>
    </div>
  );
};

export default Repayments;
