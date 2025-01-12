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

// Mock data for demonstration
const mockApplications = [
  {
    id: 1,
    applicantName: "John Doe",
    loanAmount: 5000,
    status: "Pending",
    submittedDate: "2024-01-12",
  },
  {
    id: 2,
    applicantName: "Jane Smith",
    loanAmount: 10000,
    status: "Approved",
    submittedDate: "2024-01-11",
  },
];

const Applications = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplications = mockApplications.filter((application) =>
    application.applicantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Loan Applications</h1>
          <Input
            placeholder="Search applications..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant Name</TableHead>
              <TableHead>Loan Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>{application.applicantName}</TableCell>
                <TableCell>${application.loanAmount}</TableCell>
                <TableCell>{application.status}</TableCell>
                <TableCell>{application.submittedDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default Applications;