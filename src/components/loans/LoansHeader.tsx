
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoansHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Loans Management</h1>
      <div className="flex gap-3">
        <Button onClick={() => navigate("/admin/loans/bulk")} variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Add Bulk Loans
        </Button>
        <Button onClick={() => navigate("/admin/loans/add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Loan
        </Button>
      </div>
    </div>
  );
};

export default LoansHeader;
