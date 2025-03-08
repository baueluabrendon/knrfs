
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { LoanApplicationType } from "@/types/loan";
import { getStatusBadgeClass } from "./utils";
import ApplicationDetailsPanel from "./ApplicationDetailsPanel";

interface ApplicationDetailsDialogProps {
  selectedApplication: LoanApplicationType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => Promise<void>;
  onDecline: () => Promise<void>;
  isProcessing?: boolean; // Added isProcessing prop as optional
}

const ApplicationDetailsDialog = ({
  selectedApplication,
  open,
  onOpenChange,
  onApprove,
  onDecline,
  isProcessing = false // Default to false if not provided
}: ApplicationDetailsDialogProps) => {
  const [processingAction, setProcessingAction] = useState(false);

  const handleApproval = async () => {
    setProcessingAction(true);
    await onApprove();
    setProcessingAction(false);
  };

  const handleDecline = async () => {
    setProcessingAction(true);
    await onDecline();
    setProcessingAction(false);
  };

  if (!selectedApplication) return null;

  // Use the isProcessing prop from parent if provided, otherwise use local state
  const isCurrentlyProcessing = isProcessing || processingAction;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>
        
        <ApplicationDetailsPanel application={selectedApplication} />

        <DialogFooter className="mt-6">
          {selectedApplication.status === 'pending' && (
            <>
              <Button 
                variant="outline" 
                onClick={handleDecline}
                disabled={isCurrentlyProcessing}
                className="flex items-center gap-1"
              >
                {isCurrentlyProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Decline
              </Button>
              <Button 
                onClick={handleApproval}
                disabled={isCurrentlyProcessing}
                className="flex items-center gap-1"
              >
                {isCurrentlyProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Approve
              </Button>
            </>
          )}
          {selectedApplication.status !== 'pending' && (
            <span className={`px-3 py-1 rounded-full font-medium ${getStatusBadgeClass(selectedApplication.status)}`}>
              {selectedApplication.status.toUpperCase()}
            </span>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailsDialog;
