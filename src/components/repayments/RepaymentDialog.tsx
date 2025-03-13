
import React, { useState, useEffect } from "react";
import { Plus, Upload } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import BorrowerSelect from "./BorrowerSelect";

interface RepaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const RepaymentDialog: React.FC<RepaymentDialogProps> = ({ isOpen, onOpenChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [borrowerId, setBorrowerId] = useState("");
  const [borrowerName, setBorrowerName] = useState("");
  const [loanId, setLoanId] = useState("");
  const [availableLoans, setAvailableLoans] = useState<{ id: string; status: string }[]>([]);
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    // When borrower is selected, fetch their active loans
    if (borrowerId) {
      fetchBorrowerLoans(borrowerId);
    } else {
      setLoanId("");
      setAvailableLoans([]);
    }
  }, [borrowerId]);

  const fetchBorrowerLoans = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("loans")
        .select("loan_id, loan_status")
        .eq("borrower_id", id)
        .eq("loan_status", "active");

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setAvailableLoans(data.map(loan => ({ 
          id: loan.loan_id, 
          status: loan.loan_status 
        })));
        
        // Auto-select the first active loan
        setLoanId(data[0].loan_id);
      } else {
        setAvailableLoans([]);
        setLoanId("");
        toast.info("No active loans found for this borrower");
      }
    } catch (error) {
      console.error("Error fetching borrower loans:", error);
      toast.error("Failed to load borrower loans");
    }
  };

  const handleBorrowerSelect = (id: string, name: string) => {
    setBorrowerId(id);
    setBorrowerName(name);
  };

  // Check if file is a valid type (PDF or approved image)
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
      const fileName = `${Date.now()}_${loanId}.${fileExt}`;
      const filePath = `receipts/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('repayment_receipts')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading receipt:', uploadError);
        throw new Error('Failed to upload receipt');
      }
      
      const { data } = supabase.storage
        .from('repayment_receipts')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadReceipt:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!loanId || !amount || !file) {
      toast.error("Please fill in all fields and select a receipt document.");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload the receipt file
      const receiptUrl = await uploadReceipt(file);
      
      if (!receiptUrl) {
        throw new Error("Failed to upload receipt");
      }
      
      // Insert the repayment record
      const { error } = await supabase
        .from('repayments')
        .insert({
          loan_id: loanId,
          amount: parseFloat(amount),
          receipt_url: receiptUrl,
          status: 'completed',
          payment_date: new Date().toISOString().split('T')[0]
        });
      
      if (error) {
        console.error('Error saving repayment:', error);
        throw new Error('Failed to save repayment');
      }
      
      toast.success("Repayment added successfully");
      
      // Reset form and close dialog
      setBorrowerId("");
      setBorrowerName("");
      setLoanId("");
      setAmount("");
      setFile(null);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error("Failed to add repayment. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Repayment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Repayment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="borrower">Borrower</Label>
            <BorrowerSelect onBorrowerSelect={handleBorrowerSelect} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanId">Loan ID</Label>
            <Input 
              id="loanId" 
              placeholder="Loan ID will appear here"
              value={loanId}
              readOnly
              className="bg-gray-100"
            />
            {availableLoans.length === 0 && borrowerId && (
              <p className="text-sm text-amber-600">No active loans found for this borrower</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt Document</Label>
            <Input
              id="receipt"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {fileError && <p className="text-sm text-red-500">{fileError}</p>}
            <p className="text-xs text-muted-foreground">
              Allowed file types: PDF, JPEG, PNG, BMP, TIFF
            </p>
          </div>
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isUploading || !loanId || !amount || !file}
          >
            {isUploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Receipt
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RepaymentDialog;
