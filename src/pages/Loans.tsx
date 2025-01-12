import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Eye } from "lucide-react";

const Loans = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Loans Management</h1>
        
        <ul className="space-y-4">
          <li>
            <Button variant="outline" className="w-full justify-start">
              <Eye className="mr-2" />
              View Loans
            </Button>
          </li>
          <li>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2" />
              Add Loan
            </Button>
          </li>
          <li>
            <Button variant="outline" className="w-full justify-start">
              <Clock className="mr-2" />
              Over Due Loans
            </Button>
          </li>
        </ul>
      </div>
    </DashboardLayout>
  );
};

export default Loans;