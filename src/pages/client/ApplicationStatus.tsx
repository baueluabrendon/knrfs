
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define a simple type for applications
interface Application {
  application_id: string;
  uploaded_at: string;
  status: string;
  updated_at: string | null;
}

// Mock data for applications
const mockApplications: Application[] = [
  {
    application_id: "APP001",
    uploaded_at: "2023-09-15T10:30:00Z",
    status: "pending",
    updated_at: null
  },
  {
    application_id: "APP002",
    uploaded_at: "2023-10-05T14:45:00Z",
    status: "approved",
    updated_at: "2023-10-10T09:20:00Z"
  },
  {
    application_id: "APP003",
    uploaded_at: "2023-11-20T11:15:00Z",
    status: "rejected",
    updated_at: "2023-11-25T16:30:00Z"
  }
];

const ApplicationStatus = () => {
  const { user } = useAuth();
  
  // Use mock data instead of fetching from Supabase
  const applications = mockApplications;
  const isLoading = false;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Application Status</h1>
      
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application ID</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications && applications.length > 0 ? (
              applications.map((application) => (
                <TableRow key={application.application_id}>
                  <TableCell>{application.application_id}</TableCell>
                  <TableCell>{new Date(application.uploaded_at).toLocaleDateString()}</TableCell>
                  <TableCell>{application.status}</TableCell>
                  <TableCell>{application.updated_at ? new Date(application.updated_at).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No applications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ApplicationStatus;
