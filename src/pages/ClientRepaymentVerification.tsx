import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, X, FileText, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClientRepayment {
  id: string;
  loanId: string;
  borrowerName: string;
  date: string;
  amount: number;
  status: "pending" | "verified" | "approved" | "rejected";
  receiptUrl?: string;
  notes?: string;
  source?: string;
}

const ClientRepaymentVerification = () => {
  const [repayments, setRepayments] = useState<ClientRepayment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRepayment, setSelectedRepayment] = useState<ClientRepayment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isViewDocumentOpen, setIsViewDocumentOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRepayments();
  }, []);

  const fetchRepayments = async () => {
    setIsLoading(true);
    try {
      // Check if source column exists by querying a single row first
      const { data: columnCheck, error: columnCheckError } = await supabase
        .from('repayments')
        .select(`*`)
        .limit(1);
      
      // If there's an error regarding the source column, fetch without it
      const hasSourceColumn = !columnCheckError || 
        !columnCheckError.message.includes("column 'source' does not exist");
      
      // Only fetch repayments that need verification
      // If source column doesn't exist, we'll fetch all and filter in the client
      const { data: repaymentsData, error: repaymentsError } = await supabase
        .from('repayments')
        .select(`
          repayment_id, 
          amount, 
          payment_date, 
          loan_id, 
          status, 
          receipt_url,
          notes,
          verification_status
          ${hasSourceColumn ? ', source' : ''}
        `)
        .order('payment_date', { ascending: false });
      
      if (repaymentsError) {
        console.error('Error fetching repayments:', repaymentsError);
        toast.error("Failed to fetch repayments");
        setIsLoading(false);
        return;
      }
      
      if (!repaymentsData || repaymentsData.length === 0) {
        setRepayments([]);
        setIsLoading(false);
        return;
      }
      
      // Filter client repayments if the source column exists
      let clientRepayments = repaymentsData;
      if (hasSourceColumn) {
        clientRepayments = repaymentsData.filter(
          repayment => repayment.source === 'client'
        );
      }
      
      // For each repayment, we need to fetch the borrower information
      const enrichedRepayments: ClientRepayment[] = await Promise.all(
        clientRepayments.map(async (repayment) => {
          // Fetch loan to get borrower_id
          const { data: loanData, error: loanError } = await supabase
            .from('loans')
            .select('borrower_id')
            .eq('loan_id', repayment.loan_id)
            .single();
          
          let borrowerName = "Unknown Borrower";
          
          if (!loanError && loanData && loanData.borrower_id) {
            // Fetch borrower name using borrower_id
            const { data: borrowerData, error: borrowerError } = await supabase
              .from('borrowers')
              .select('given_name, surname')
              .eq('borrower_id', loanData.borrower_id)
              .single();
            
            if (!borrowerError && borrowerData) {
              borrowerName = `${borrowerData.given_name} ${borrowerData.surname}`;
            }
          }
          
          // Map verification_status to status for UI consistency
          let uiStatus = repayment.status;
          if (repayment.verification_status === 'pending') {
            uiStatus = 'pending';
          } else if (repayment.verification_status === 'verified') {
            uiStatus = 'verified';
          } else if (repayment.verification_status === 'approved') {
            uiStatus = 'approved';
          } else if (repayment.verification_status === 'rejected') {
            uiStatus = 'rejected';
          }
          
          return {
            id: repayment.repayment_id,
            loanId: repayment.loan_id || "Unknown",
            borrowerName,
            date: repayment.payment_date || new Date().toISOString(),
            amount: Number(repayment.amount),
            status: uiStatus as "pending" | "verified" | "approved" | "rejected",
            receiptUrl: repayment.receipt_url,
            notes: repayment.notes,
            source: hasSourceColumn ? repayment.source : 'unknown'
          };
        })
      );
      
      setRepayments(enrichedRepayments);
    } catch (error) {
      console.error('Error in fetchRepayments:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRepayments = repayments.filter(repayment => 
    filterStatus === "all" || repayment.status === filterStatus
  );

  const handleViewDetails = (repayment: ClientRepayment) => {
    setSelectedRepayment(repayment);
    setIsDetailsOpen(true);
    setActionNotes("");
  };

  const handleViewDocument = (repayment: ClientRepayment) => {
    setSelectedRepayment(repayment);
    setIsViewDocumentOpen(true);
  };

  const updateRepaymentStatus = async (newStatus: "verified" | "approved" | "rejected") => {
    if (!selectedRepayment) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('repayments')
        .update({ 
          status: newStatus,
          verification_status: newStatus,
          notes: actionNotes || selectedRepayment.notes,
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.email
        })
        .eq('repayment_id', selectedRepayment.id);
      
      if (error) {
        console.error('Error updating repayment:', error);
        toast.error("Failed to update repayment status");
        return;
      }
      
      // Update local state
      setRepayments(repayments.map(rep => 
        rep.id === selectedRepayment.id 
          ? { ...rep, status: newStatus, notes: actionNotes || rep.notes } 
          : rep
      ));
      
      toast.success(`Repayment ${newStatus} successfully`);
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error in updateRepaymentStatus:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";
    
    switch (status) {
      case "pending":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case "verified":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      case "approved":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "rejected":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
    }
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Client Repayment Verification</h1>
        <div className="w-72">
          <Select 
            value={filterStatus} 
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center py-10">Loading repayments...</div>
        ) : (
          <Table>
            <TableCaption>List of client repayments to verify</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No repayments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRepayments.map((repayment) => (
                  <TableRow key={repayment.id}>
                    <TableCell>{repayment.loanId}</TableCell>
                    <TableCell>{repayment.borrowerName}</TableCell>
                    <TableCell>{new Date(repayment.date).toLocaleDateString()}</TableCell>
                    <TableCell>${repayment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {repayment.notes ? (
                        <span className="truncate max-w-[150px] block">{repayment.notes}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={repayment.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewDetails(repayment)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        {repayment.receiptUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDocument(repayment)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Document
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Repayment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Repayment</DialogTitle>
            <DialogDescription>
              Verify and approve or reject this repayment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRepayment && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Loan ID</Label>
                  <p className="text-sm font-medium">{selectedRepayment.loanId}</p>
                </div>
                <div>
                  <Label>Borrower</Label>
                  <p className="text-sm font-medium">{selectedRepayment.borrowerName}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedRepayment.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="text-sm font-medium">${selectedRepayment.amount.toFixed(2)}</p>
                </div>
                <div className="col-span-2">
                  <Label>Current Status</Label>
                  <p className="text-sm font-medium mt-1">
                    <StatusBadge status={selectedRepayment.status} />
                  </p>
                </div>
                {selectedRepayment.notes && (
                  <div className="col-span-2">
                    <Label>Client Notes</Label>
                    <p className="text-sm">{selectedRepayment.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Verification Notes</Label>
                <Input
                  id="notes"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Add notes about this verification"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="space-x-2">
              {selectedRepayment?.status === "pending" && (
                <Button 
                  variant="outline" 
                  onClick={() => updateRepaymentStatus("verified")}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Verify
                </Button>
              )}
              {(selectedRepayment?.status === "pending" || selectedRepayment?.status === "verified") && (
                <Button 
                  variant="destructive" 
                  onClick={() => updateRepaymentStatus("rejected")}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              )}
            </div>
            {selectedRepayment?.status === "verified" && (
              <Button 
                variant="default"
                onClick={() => updateRepaymentStatus("approved")}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={isViewDocumentOpen} onOpenChange={setIsViewDocumentOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Receipt Document</DialogTitle>
          </DialogHeader>
          
          {selectedRepayment?.receiptUrl && (
            <div className="w-full h-[70vh] overflow-hidden">
              <iframe 
                src={selectedRepayment.receiptUrl} 
                className="w-full h-full"
                title="Receipt Document"
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDocumentOpen(false)}>
              Close
            </Button>
            {selectedRepayment?.receiptUrl && (
              <Button asChild>
                <a href={selectedRepayment.receiptUrl} target="_blank" rel="noopener noreferrer">
                  Open in New Tab
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientRepaymentVerification;
