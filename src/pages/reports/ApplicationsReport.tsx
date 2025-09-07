import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApplicationsReport = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/admin/reports")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reports</span>
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Applications Reports</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Application Analytics Dashboard</h2>
        <p className="text-gray-600">Loan application reports and analytics will be displayed here.</p>
      </Card>
    </div>
  );
};

export default ApplicationsReport;