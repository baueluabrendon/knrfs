import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getClientRefinanceApplications } from "@/lib/api/refinance";
import { format } from "date-fns";
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

export const RefinanceApplicationsList = () => {
  const { user } = useAuth();
  
  const { data: refinanceApplications, isLoading } = useQuery({
    queryKey: ['client-refinance-applications', user?.email],
    queryFn: () => getClientRefinanceApplications(user?.email || ''),
    enabled: !!user?.email,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'in_review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'additional_documents_required':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'additional_documents_required':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading refinance applications...</span>
        </div>
      </Card>
    );
  }

  if (!refinanceApplications || refinanceApplications.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Refinance Applications</h3>
          <p className="text-gray-500">You haven't submitted any refinance applications yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-blue-600" />
          Refinance Applications History
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Track the status of your loan refinance applications
        </p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Application ID</TableHead>
            <TableHead>Original Loan</TableHead>
            <TableHead>Submitted Date</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refinanceApplications.map((app) => (
            <TableRow key={app.application_id}>
              <TableCell className="font-medium">
                {app.application_id.slice(0, 8)}...
              </TableCell>
              <TableCell>
                {app.refinanced_from_loan_id || 'N/A'}
              </TableCell>
              <TableCell>
                {app.uploaded_at ? format(new Date(app.uploaded_at), 'dd/MM/yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                {app.updated_at ? format(new Date(app.updated_at), 'dd/MM/yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={`${getStatusColor(app.status)} flex items-center gap-1 w-fit`}
                >
                  {getStatusIcon(app.status)}
                  {app.status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};