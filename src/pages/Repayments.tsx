
import { useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import RepaymentDialog from "@/components/repayments/RepaymentDialog";
import RepaymentsTable from "@/components/repayments/RepaymentsTable";
import { sampleRepayments } from "@/components/repayments/sampleData";

const Repayments = () => {
  const [repayments] = useState(sampleRepayments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Repayments Management</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/repayments/bulk">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Link>
          </Button>
          <RepaymentDialog 
            isOpen={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
          />
        </div>
      </div>

      <Card className="p-6">
        <RepaymentsTable repayments={repayments} />
      </Card>
    </div>
  );
};

export default Repayments;
