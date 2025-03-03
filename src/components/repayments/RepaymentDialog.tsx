
import React, { useState } from "react";
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
import { uploadReceiptToSupabase } from "@/contexts/loan-application/document-uploader";

interface RepaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const RepaymentDialog: React.FC<RepaymentDialogProps> = ({ isOpen, onOpenChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && loanId) {
      setIsUploading(true);
      try {
        const success = await uploadReceiptToSupabase(file, loanId);
        if (success) {
          toast.success("Receipt uploaded successfully");
          onOpenChange(false);
        } else {
          toast.error("Failed to upload receipt");
        }
      } catch (error) {
        console.error("Error uploading receipt:", error);
        toast.error("An unexpected error occurred while uploading receipt");
      } finally {
        setIsUploading(false);
      }
    } else {
      toast.error("Please select a file and enter a loan ID");
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
          <DialogTitle>Upload Repayment Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loanId">Loan ID</Label>
            <Input 
              id="loanId" 
              placeholder="Enter loan ID"
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
            />
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
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>
          <Button 
            className="w-full" 
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
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
