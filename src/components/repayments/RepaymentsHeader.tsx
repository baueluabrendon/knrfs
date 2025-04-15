
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import RepaymentDialog from "@/components/repayments/RepaymentDialog";

interface RepaymentsHeaderProps {
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

const RepaymentsHeader = ({ isDialogOpen, onDialogOpenChange }: RepaymentsHeaderProps) => {
  return (
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
          onOpenChange={onDialogOpenChange} 
        />
      </div>
    </div>
  );
};

export default RepaymentsHeader;
