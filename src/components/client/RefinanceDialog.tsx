import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, FileText, Clock } from "lucide-react";
import { toast } from "sonner";

interface Loan {
  loan_id: string;
  principal: number;
  outstanding_balance?: number;
  repayment_completion_percentage?: number;
}

interface RefinanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
}

export const RefinanceDialog = ({ isOpen, onClose, loan }: RefinanceDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleProceedToApplication = async () => {
    if (!loan) return;
    
    setIsLoading(true);
    
    try {
      // Store refinance context in sessionStorage to pass to application form
      const refinanceContext = {
        type: 'refinance',
        originalLoanId: loan.loan_id,
        originalPrincipal: loan.principal,
        outstandingBalance: loan.outstanding_balance || 0,
        completionPercentage: loan.repayment_completion_percentage || 0,
      };
      
      sessionStorage.setItem('refinanceContext', JSON.stringify(refinanceContext));
      
      // Navigate to application form
      navigate('/client/apply');
      
      toast.success("Redirecting to refinance application...");
      onClose();
      
    } catch (error) {
      console.error('Error starting refinance application:', error);
      toast.error("Failed to start refinance application");
    } finally {
      setIsLoading(false);
    }
  };

  if (!loan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <DialogTitle>Internal Loan Refinancing</DialogTitle>
          </div>
          <DialogDescription>
            Apply for a new loan to refinance your existing loan {loan.loan_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Loan Summary */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Current Loan Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Loan ID:</span>
                <span className="ml-2 font-medium">{loan.loan_id}</span>
              </div>
              <div>
                <span className="text-gray-600">Original Amount:</span>
                <span className="ml-2 font-medium">K{loan.principal?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Outstanding Balance:</span>
                <span className="ml-2 font-medium">K{loan.outstanding_balance?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Completion:</span>
                <span className="ml-2 font-medium">{loan.repayment_completion_percentage?.toFixed(1)}%</span>
              </div>
            </div>
          </Card>

          {/* Refinance Process */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Refinancing Process
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-semibold">1</div>
                <div>
                  <p className="font-medium">Submit New Application</p>
                  <p className="text-sm text-gray-600">Complete a new loan application with updated information and supporting documents</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-semibold">2</div>
                <div>
                  <p className="font-medium">Approval Process</p>
                  <p className="text-sm text-gray-600">Your application will be reviewed and processed by our team</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-semibold">3</div>
                <div>
                  <p className="font-medium">Loan Settlement</p>
                  <p className="text-sm text-gray-600">Upon approval, your current loan will be settled and the new loan terms will take effect</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Important Notes */}
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Important Notes</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• You must provide all required supporting documents</li>
                  <li>• The refinance application is subject to approval</li>
                  <li>• Current loan payments continue until new loan is approved</li>
                  <li>• New loan terms may differ from your current loan</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Processing Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>Processing time: Typically 3-5 business days</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleProceedToApplication} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Starting Application...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Start Refinance Application
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};