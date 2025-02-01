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

const ApplicationStatus = () => {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['loan-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('borrower_id', user?.id);
      
      if (error) throw error;
      return data;
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
              <TableHead>Amount Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications && applications.length > 0 ? (
              applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.id}</TableCell>
                  <TableCell>{application.created_at}</TableCell>
                  <TableCell>${application.amount_requested?.toLocaleString()}</TableCell>
                  <TableCell>{application.status}</TableCell>
                  <TableCell>{application.updated_at}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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