import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessUserManagementReports } from "@/utils/roleBasedAccess";
import {
  Users,
  User,
  FileText,
  Wallet,
  RefreshCcw,
  PiggyBank,
  Tag
} from "lucide-react";

const reportCategories = [
  {
    title: "User Management Reports",
    description: "Generate reports on system users and administrators",
    icon: Users,
    path: "/admin/reports/users",
    color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
  },
  {
    title: "Borrowers Reports",
    description: "Comprehensive borrower analytics and demographics",
    icon: User,
    path: "/admin/reports/borrowers",
    color: "bg-green-50 hover:bg-green-100 border-green-200"
  },
  {
    title: "Applications Reports",
    description: "Loan application status and processing analytics",
    icon: FileText,
    path: "/admin/reports/applications",
    color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
  },
  {
    title: "Loans Reports",
    description: "Portfolio performance and loan analytics",
    icon: Wallet,
    path: "/admin/reports/loans",
    color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
  },
  {
    title: "Repayments Reports",
    description: "Payment history and collection analytics",
    icon: RefreshCcw,
    path: "/admin/reports/repayments",
    color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200"
  },
  {
    title: "Recoveries Reports",
    description: "Arrears, missed payments, and recovery analytics",
    icon: PiggyBank,
    path: "/admin/reports/recoveries",
    color: "bg-red-50 hover:bg-red-100 border-red-200"
  },
  {
    title: "Promotions Reports",
    description: "Marketing campaigns and promotion effectiveness",
    icon: Tag,
    path: "/admin/reports/promotions",
    color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
  }
];

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Filter out User Management Reports for certain roles
  const filteredReportCategories = reportCategories.filter(category => {
    if (category.title === "User Management Reports") {
      return canAccessUserManagementReports(user);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600 mt-2">Generate comprehensive reports across all system modules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReportCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card key={category.path} className={`p-6 border-2 transition-all duration-200 hover:shadow-lg ${category.color}`}>
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-white shadow-sm">
                  <IconComponent className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <Button 
                    onClick={() => navigate(category.path)}
                    className="w-full"
                    variant="default"
                  >
                    Generate Report
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;