
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

// Define a more specific type for applications to avoid deep type instantiation
type Application = {
  application_id: string;
  uploaded_at: string;
  status: string | null;
  updated_at: string | null;
}

const ApplicationStatus = () => {
  const { user } = useAuth();

  // Explicitly type the queryFn return type to avoid deep instantiation
  const { data: applications, isLoading } = useQuery({
    queryKey: ['client-applications'],
    queryFn: async (): Promise<Application[]> => {
      if (!user?.user_id) return [];
      
      // Using a more direct approach with explicit typing
      const { data, error } = await supabase
        .from('applications')
        .select('application_id, uploaded_at, status, updated_at')
        .eq('borrower_id', user.user_id);
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
                  <TableCell>{application.uploaded_at}</TableCell>
                  <TableCell>{application.status}</TableCell>
                  <TableCell>{application.updated_at}</TableCell>
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
