import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, UserPlus, Upload } from "lucide-react";

const Borrowers = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Borrowers Management</h1>
        <Card className="p-6">
          <ul className="space-y-4">
            <li>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2" />
                View All Borrowers
              </Button>
            </li>
            <li>
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="mr-2" />
                Add Borrower
              </Button>
            </li>
            <li>
              <Button className="w-full justify-start" variant="outline">
                <Upload className="mr-2" />
                Add Bulk Borrowers
              </Button>
            </li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Borrowers;