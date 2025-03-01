import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";

const Applications = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loan Applications</h1>
      </div>
      <Card className="p-6">
        <p>List of loan applications will be displayed here</p>
      </Card>
    </div>
  );
};

export default Applications;
