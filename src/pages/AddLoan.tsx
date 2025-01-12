import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";

const AddLoan = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Add New Loan</h1>
        </div>
        <Card className="p-6">
          <p>Add Loan form will be implemented here</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddLoan;