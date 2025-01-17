import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Application {
  id: string;
  date: string;
  borrowerName: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  purpose: string;
}

const sampleApplications: Application[] = [
  {
    id: "APP001",
    date: "2024-01-15",
    borrowerName: "John Doe",
    amount: 5000.00,
    status: "pending",
    purpose: "Business Expansion"
  },
  {
    id: "APP002",
    date: "2024-01-14",
    borrowerName: "Jane Smith",
    amount: 3000.00,
    status: "approved",
    purpose: "Education"
  },
  {
    id: "APP003",
    date: "2024-01-13",
    borrowerName: "Bob Wilson",
    amount: 2000.00,
    status: "rejected",
    purpose: "Home Improvement"
  }
];

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