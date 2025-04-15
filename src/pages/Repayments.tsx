
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import RepaymentsHeader from "@/components/repayments/RepaymentsHeader";
import RepaymentsTable from "@/components/repayments/RepaymentsTable";
import RepaymentsSearchBar from "@/components/repayments/RepaymentsSearchBar";
import { useRepaymentsList } from "@/hooks/useRepaymentsList";

const Repayments = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: repayments = [], isLoading, refetch } = useRepaymentsList();

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      refetch();
    }
  };

  const filteredRepayments = useMemo(() => {
    if (!searchQuery.trim()) return repayments;
    
    const query = searchQuery.toLowerCase().trim();
    return repayments.filter((repayment) => {
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
      <RepaymentsHeader 
        isDialogOpen={isDialogOpen} 
        onDialogOpenChange={handleDialogOpenChange} 
      />

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
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
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
