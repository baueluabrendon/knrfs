
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ClientRepaymentSubmission from "@/components/client/ClientRepaymentSubmission";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Loader2 } from "lucide-react";
import RepaymentsSearchBar from "@/components/repayments/RepaymentsSearchBar";
import { useClientRepayments } from "@/hooks/useClientData";

const ClientRepayments = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);

  const { data: repayments, isLoading, error, refetch } = useClientRepayments();

  const handleSubmissionSuccess = () => {
    // Refetch repayments after successful submission
    refetch();
  };

  // Filter repayments based on search query
  const filteredRepayments = useMemo(() => {
    if (!repayments || !searchQuery.trim()) return repayments || [];
    
    const query = searchQuery.toLowerCase().trim();
    return repayments.filter((repayment) => {
      const date = repayment.payment_date 
        ? new Date(repayment.payment_date).toLocaleDateString().toLowerCase() 
        : '';
      const amount = repayment.amount.toString();
      const repaymentId = repayment.repayment_id?.toLowerCase() || '';
      const loanId = repayment.loan_id?.toLowerCase() || '';
      const status = repayment.status?.toLowerCase() || '';
      
      return (
        date.includes(query) ||
        amount.includes(query) ||
        repaymentId.includes(query) ||
        loanId.includes(query) ||
        status.includes(query)
      );
    });
  }, [repayments, searchQuery]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center text-red-500">
            Error loading repayments. Please try again later.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Repayments</h1>
        <Button onClick={() => setIsSubmissionOpen(true)}>
          Submit Repayment
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <RepaymentsSearchBar 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery}
              totalCount={repayments?.length ?? 0}
              filteredCount={filteredRepayments?.length ?? 0}
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
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredRepayments?.length > 0 ? (
                  filteredRepayments.map((repayment) => (
                    <TableRow key={repayment.repayment_id}>
                      <TableCell>{repayment.repayment_id || 'N/A'}</TableCell>
                      <TableCell>
                        {repayment.payment_date 
                          ? new Date(repayment.payment_date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>K{repayment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                            ${
                              repayment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : repayment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : repayment.status === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : repayment.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {repayment.status 
                            ? repayment.status.charAt(0).toUpperCase() + repayment.status.slice(1)
                            : 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {repayment.payment_date 
                          ? new Date(repayment.payment_date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
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

      <ClientRepaymentSubmission
        isOpen={isSubmissionOpen}
        onOpenChange={setIsSubmissionOpen}
        onSubmissionSuccess={handleSubmissionSuccess}
      />
    </div>
  );
};

export default ClientRepayments;
