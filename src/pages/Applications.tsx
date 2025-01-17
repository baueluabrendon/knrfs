import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

interface Application {
  id: string;
  applicantName: string;
  loanAmount: number;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  purpose: string;
  creditScore: number;
}

const Applications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Mock data for demonstration
  const applications: Application[] = [
    {
      id: "APP001",
      applicantName: "John Doe",
      loanAmount: 5000,
      status: "pending",
      submittedDate: "2024-01-12",
      purpose: "Business Expansion",
      creditScore: 720,
    },
    {
      id: "APP002",
      applicantName: "Jane Smith",
      loanAmount: 10000,
      status: "pending",
      submittedDate: "2024-01-11",
      purpose: "Equipment Purchase",
      creditScore: 680,
    },
  ];

  const handleApprove = (applicationId: string) => {
    toast({
      title: "Application Approved",
      description: `Application ${applicationId} has been approved successfully.`,
    });
  };

  const handleReject = (applicationId: string) => {
    toast({
      title: "Application Rejected",
      description: `Application ${applicationId} has been rejected.`,
    });
  };

  const filteredApplications = applications.filter((application) =>
    application.applicantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Loan Applications Review</h1>
          <Input
            placeholder="Search applications..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Applicant Name</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Credit Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.id}</TableCell>
                  <TableCell>{application.applicantName}</TableCell>
                  <TableCell>${application.loanAmount.toLocaleString()}</TableCell>
                  <TableCell>{application.purpose}</TableCell>
                  <TableCell>{application.creditScore}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        application.status === "approved"
                          ? "success"
                          : application.status === "rejected"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(application.submittedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                        onClick={() => handleApprove(application.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleReject(application.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Applications;