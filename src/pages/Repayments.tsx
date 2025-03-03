
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import RepaymentDialog from "@/components/repayments/RepaymentDialog";
import RepaymentsTable from "@/components/repayments/RepaymentsTable";
import { sampleRepayments } from "@/components/repayments/sampleData";

const Repayments = () => {
  const [repayments] = useState(sampleRepayments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Repayments Management</h1>
        <RepaymentDialog 
          isOpen={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
        />
      </div>

      <Card className="p-6">
        <RepaymentsTable repayments={repayments} />
      </Card>
    </div>
  );
};

export default Repayments;
