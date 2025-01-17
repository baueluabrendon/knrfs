import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Application {
  id: string;
  date: string;
  borrowerName: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  purpose: string;
  reviewStatus: "verified" | "pending_review" | "in_review" | "needs_info";
  reviewedBy?: string;
}

const sampleApplications: Application[] = [
  {
    id: "APP001",
    date: "2024-01-15",
    borrowerName: "John Doe",
    amount: 5000.00,
    status: "pending",
    purpose: "Business Expansion",
    reviewStatus: "pending_review",
    reviewedBy: undefined
  },
  {
    id: "APP002",
    date: "2024-01-14",
    borrowerName: "Jane Smith",
    amount: 3000.00,
    status: "approved",
    purpose: "Education",
    reviewStatus: "verified",
    reviewedBy: "OFF001 - Sarah Johnson"
  },
  {
    id: "APP003",
    date: "2024-01-13",
    borrowerName: "Bob Wilson",
    amount: 2000.00,
    status: "rejected",
    purpose: "Home Improvement",
    reviewStatus: "needs_info",
    reviewedBy: "OFF002 - Michael Chen"
  },
  {
    id: "APP004",
    date: "2024-01-12",
    borrowerName: "Alice Brown",
    amount: 7500.00,
    status: "pending",
    purpose: "Debt Consolidation",
    reviewStatus: "in_review",
    reviewedBy: "OFF003 - David Lee"
  }
];

const getReviewStatusBadge = (status: Application['reviewStatus']) => {
  const statusConfig = {
    verified: { color: "bg-green-100 text-green-800", label: "Verified" },
    pending_review: { color: "bg-yellow-100 text-yellow-800", label: "Pending Review" },
    in_review: { color: "bg-blue-100 text-blue-800", label: "In Review" },
    needs_info: { color: "bg-red-100 text-red-800", label: "Additional Info Needed" }
  };

  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={`${config.color} border-none`}>
      {config.label}
    </Badge>
  );
};

const Applications = () => {
  const [applications] = useState<Application[]>(sampleApplications);

  const handleApprove = (id: string) => {
    console.log(`Approving application ${id}`);
  };

  const handleReject = (id: string) => {
    console.log(`Rejecting application ${id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Loan Applications</h1>
        <Card className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Review Status</TableHead>
                  <TableHead>Reviewed By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>{new Date(application.date).toLocaleDateString()}</TableCell>
                      <TableCell>{application.id}</TableCell>
                      <TableCell>{application.borrowerName}</TableCell>
                      <TableCell>{application.purpose}</TableCell>
                      <TableCell className="text-right">
                        ${application.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                          ${application.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getReviewStatusBadge(application.reviewStatus)}
                      </TableCell>
                      <TableCell>
                        {application.reviewedBy || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {application.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(application.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(application.id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Applications;