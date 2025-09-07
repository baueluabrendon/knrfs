import React, { useState, useEffect } from "react";
import { Plus, Upload, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

interface ClientRepaymentSubmissionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmissionSuccess?: () => void;
}

interface LoanOption {
  loan_id: string;
  outstanding_balance: number;
  fortnightly_installment: number;
}

const ClientRepaymentSubmission: React.FC<ClientRepaymentSubmissionProps> = ({ 
  isOpen, 
  onOpenChange,
  onSubmissionSuccess 
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState("");
  const [availableLoans, setAvailableLoans] = useState<LoanOption[]>([]);
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoadingLoans, setIsLoadingLoans] = useState(false);

  useEffect(() => {
    if (isOpen && user?.user_id) {
      fetchClientLoans();
    }
  }, [isOpen, user?.user_id]);

  const fetchClientLoans = async () => {
    if (!user?.user_id) return;
    
    setIsLoadingLoans(true);
    try {
      // Get user's borrower_id first
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("borrower_id")
        .eq("user_id", user.user_id)
        .single();

      if (profileError || !userProfile?.borrower_id) {
        toast.error("Could not find borrower profile");
        return;
      }

      // Fetch active loans for this borrower
      const { data: loans, error: loansError } = await supabase
        .from("loans")
        .select("loan_id, outstanding_balance, fortnightly_installment")
        .eq("borrower_id", userProfile.borrower_id)
        .eq("loan_status", "active");

      if (loansError) {
        console.error("Error fetching loans:", loansError);
        toast.error("Failed to load active loans");
        return;
      }

      setAvailableLoans(loans || []);
      
      if (loans && loans.length > 0) {
        setSelectedLoan(loans[0].loan_id);
        setAmount(loans[0].fortnightly_installment.toString());
      }
    } catch (error) {
      console.error("Error in fetchClientLoans:", error);
      toast.error("An error occurred while loading loans");
    } finally {
      setIsLoadingLoans(false);
    }
  };

  const handleLoanSelect = (loanId: string) => {
    setSelectedLoan(loanId);
    const loan = availableLoans.find(l => l.loan_id === loanId);
    if (loan) {
      setAmount(loan.fortnightly_installment.toString());
    }
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/bmp', 
      'image/tiff'
    ];
    return validTypes.includes(file.type);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFileError("");
    
    if (selectedFile) {
      if (isValidFileType(selectedFile)) {
        setFile(selectedFile);
      } else {
        setFileError("Invalid file type. Please upload a PDF, JPEG, PNG, BMP, or TIFF file.");
        event.target.value = '';
      }
    }
  };

  const uploadReceipt = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `client_${Date.now()}_${selectedLoan}.${fileExt}`;
      const filePath = `client-repayments/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('application_documents')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading receipt:', uploadError);
        throw new Error('Failed to upload receipt');
      }
      
      const { data } = supabase.storage
        .from('application_documents')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadReceipt:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!selectedLoan || !amount || !file || !paymentDate) {
      toast.error("Please fill in all required fields and upload a receipt.");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload the receipt file
      const receiptUrl = await uploadReceipt(file);
      
      if (!receiptUrl) {
        throw new Error("Failed to upload receipt");
      }
      
      // Insert the repayment record with 'client' source
      const { error } = await supabase
        .from('repayments')
        .insert({
          loan_id: selectedLoan,
          amount: parseFloat(amount),
          receipt_url: receiptUrl,
          payment_date: paymentDate,
          notes: notes || null,
          source: 'client' // This will trigger the verification workflow
        });
      
      if (error) {
        console.error('Error saving repayment:', error);
        throw new Error('Failed to submit repayment');
      }
      
      toast.success("Repayment submitted successfully! It will be reviewed by our team.");
      
      // Reset form and close dialog
      setSelectedLoan("");
      setAmount("");
      setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
      setFile(null);
      setNotes("");
      setFileError("");
      onOpenChange(false);
      
      // Call success callback if provided
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("Failed to submit repayment. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const selectedLoanDetails = availableLoans.find(l => l.loan_id === selectedLoan);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Repayment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loan">Select Loan</Label>
            {isLoadingLoans ? (
              <div className="text-sm text-muted-foreground">Loading loans...</div>
            ) : availableLoans.length === 0 ? (
              <div className="text-sm text-muted-foreground">No active loans found</div>
            ) : (
              <Select value={selectedLoan} onValueChange={handleLoanSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a loan" />
                </SelectTrigger>
                <SelectContent>
                  {availableLoans.map((loan) => (
                    <SelectItem key={loan.loan_id} value={loan.loan_id}>
                      {loan.loan_id} - Outstanding: K{loan.outstanding_balance.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {selectedLoanDetails && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                <div>Fortnightly Payment: K{selectedLoanDetails.fortnightly_installment.toFixed(2)}</div>
                <div>Outstanding Balance: K{selectedLoanDetails.outstanding_balance.toFixed(2)}</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01"
              placeholder="Enter repayment amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="paymentDate" 
                type="date" 
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information about this repayment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt Document *</Label>
            <Input
              id="receipt"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {fileError && <p className="text-sm text-red-500">{fileError}</p>}
            <p className="text-xs text-muted-foreground">
              Required: Upload proof of payment (PDF, JPEG, PNG, BMP, TIFF)
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isUploading || !selectedLoan || !amount || !file || !paymentDate || availableLoans.length === 0}
          >
            {isUploading ? (
              <span>Submitting...</span>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit for Review
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Your repayment will be reviewed by our team before being processed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientRepaymentSubmission;