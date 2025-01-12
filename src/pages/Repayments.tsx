import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCcw, PlusCircle, Upload } from "lucide-react";

const Repayments = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Repayments Management</h1>
        <Card className="p-6">
          <ul className="space-y-4">
            <li>
              <Button className="w-full justify-start" variant="outline">
                <RefreshCcw className="mr-2" />
                View All Repayments
              </Button>
            </li>
            <li>
              <Button className="w-full justify-start" variant="outline">
                <PlusCircle className="mr-2" />
                Add Repayment
              </Button>
            </li>
            <li>
              <Button className="w-full justify-start" variant="outline">
                <Upload className="mr-2" />
                Add Bulk Repayment
              </Button>
            </li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Repayments;