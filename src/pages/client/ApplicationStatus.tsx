
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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

// Define a specific type for applications
type Application = {
  application_id: string;
  uploaded_at: string;
  status: string;
  updated_at: string | null;
}

const ApplicationStatus = () => {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['client-applications', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return [] as Application[];
      
      console.log("Fetching applications for user:", user.user_id);
      
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('application_id, uploaded_at, status, updated_at')
          .eq('borrower_id', user.user_id);
        
        if (error) {
          console.error("Error fetching applications:", error);
          throw error;
        }
        
        // Ensure we have the correct data structure
        return (data || []).map(app => ({
          application_id: app.application_id,
          uploaded_at: app.uploaded_at,
          status: app.status || 'pending',
          updated_at: app.updated_at
        })) as Application[];
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        return [] as Application[];
      }
    },
    enabled: !!user?.user_id, // Only run query if we have a user ID
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
