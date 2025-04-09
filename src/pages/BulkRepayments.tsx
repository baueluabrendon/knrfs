import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { FileText, Loader2, Table as TableIcon, X, Download, FileEdit } from "lucide-react";
import { uploadGroupRepaymentDocument } from "@/contexts/loan-application/document-uploader";
import { Repayment, BulkRepaymentData } from "@/types/repayment";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";

const BulkRepayments = () => {
  const [parsedData, setParsedData] = useState<BulkRepaymentData[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [isParsingCSV, setIsParsingCSV] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const documentFileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    setIsParsingCSV(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          validateCSVHeaders(results.meta.fields || []);
          
          const processedData: BulkRepaymentData[] = [];
          for (const row of results.data as any[]) {
            const borrowerName = row.borrower;
            const amount = parseFloat(row.amount);
            const date = row.date;
            const notes = row.notes || ''; // Get notes from CSV or default to empty string
            
            if (!borrowerName || isNaN(amount) || !date) {
              continue;
            }
            
            let loanId = '';
            
            const names = borrowerName.split(' ');
            if (names.length >= 2) {
              const given_name = names[0];
              const surname = names.slice(1).join(' ');
              
              const { data: borrowerData } = await supabase
                .from('borrowers')
                .select('borrower_id')
                .ilike('given_name', given_name)
                .ilike('surname', surname)
                .limit(1);
                
              if (borrowerData && borrowerData.length > 0) {
                const borrowerId = borrowerData[0].borrower_id;
                
                const { data: loanData } = await supabase
                  .from('loans')
                  .select('loan_id')
                  .eq('borrower_id', borrowerId)
                  .eq('loan_status', 'active')
                  .limit(1);
                  
                if (loanData && loanData.length > 0) {
                  loanId = loanData[0].loan_id;
                }
              }
            }
            
            processedData.push({
              borrowerName,
              amount,
              date,
              loanId,
              status: loanId ? 'pending' : 'failed',
              payPeriod: "Current",
              notes
            });
          }
          
          setParsedData(processedData);
          toast.success("CSV file parsed successfully");
        } catch (error: any) {
          console.error("Error parsing CSV:", error);
          toast.error(error.message || "Failed to parse CSV file. Please check the format.");
          setCsvFile(null);
        } finally {
          setIsParsingCSV(false);
        }
      },
      error: (error) => {
        console.error("PapaParse error:", error);
        toast.error("Error reading CSV file");
        setIsParsingCSV(false);
        setCsvFile(null);
      }
    });
  };

  const validateCSVHeaders = (headers: string[]) => {
    const requiredHeaders = ['borrower', 'amount', 'date'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingDocument(true);
    setDocumentFile(file);

    try {
      const documentPath = await uploadGroupRepaymentDocument(file);
      
      if (documentPath) {
        setDocumentUrl(documentPath);
        toast.success("Repayment document uploaded successfully");
      } else {
        toast.error("Failed to upload repayment document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Error uploading document. Please try again.");
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleSubmitRepayments = async () => {
    if (parsedData.length === 0) {
      toast.error("No repayment data to submit");
      return;
    }
    
    if (!documentUrl) {
      toast.error("Please upload a repayment group document");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: columnCheckError } = await supabase
        .from('repayments')
        .select(`status, source`)
        .limit(1);
      
      const hasSourceColumn = !columnCheckError || 
        !columnCheckError.message?.includes("column 'source' does not exist");
      
      const repaymentsToInsert = parsedData
        .filter(item => item.loanId)
        .map(item => {
          const repayment = {
            loan_id: item.loanId,
            amount: item.amount,
            payment_date: item.date,
            status: 'completed',
            receipt_url: documentUrl,
            notes: item.notes,
            verification_status: 'approved',
            verified_at: new Date().toISOString(),
            verified_by: user?.email
          };
          
          if (hasSourceColumn) {
            return { ...repayment, source: 'admin' };
          }
          
          return repayment;
        });
      
      if (repaymentsToInsert.length === 0) {
        toast.error("No valid repayments to submit");
        setIsSubmitting(false);
        return;
      }
      
      const { error } = await supabase
        .from('repayments')
        .insert(repaymentsToInsert);
        
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success(`Successfully processed ${repaymentsToInsert.length} repayments`);
      resetForm();
    } catch (error) {
      console.error("Error submitting repayments:", error);
      toast.error("Failed to submit repayments. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSVUploadClick = () => {
    if (csvFileInputRef.current) {
      csvFileInputRef.current.click();
    }
  };

  const handleDocumentUploadClick = () => {
    if (documentFileInputRef.current) {
      documentFileInputRef.current.click();
    }
  };

  const resetForm = () => {
    setParsedData([]);
    setCsvFile(null);
    setDocumentFile(null);
    setDocumentUrl(null);
    
    if (csvFileInputRef.current) csvFileInputRef.current.value = '';
    if (documentFileInputRef.current) documentFileInputRef.current.value = '';
  };

  const handleCancelUpload = () => {
    resetForm();
    toast.info("Upload process cancelled");
  };

  const downloadCSVTemplate = () => {
    const headers = "borrower,amount,date,notes\n";
    const sampleData = "John Doe,500,2024-06-15,First payment\nJane Smith,750,2024-06-15,Monthly payment\n";
    const csvContent = headers + sampleData;
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "repayments_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV template downloaded");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Bulk Repayments Upload</h1>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Repayments CSV File</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  ref={csvFileInputRef}
                  onChange={handleCSVSelect}
                  disabled={isParsingCSV}
                />
                <Button 
                  variant="outline"
                  onClick={handleCSVUploadClick} 
                  disabled={isParsingCSV}
                  className="flex-shrink-0 w-auto"
                >
                  {isParsingCSV ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <TableIcon className="mr-2 h-4 w-4" />
                      Select CSV
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={downloadCSVTemplate}
                  className="flex-shrink-0 w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
                
                {csvFile && (
                  <div className="text-sm text-green-600 flex items-center gap-1 ml-2">
                    <FileText className="h-4 w-4" />
                    {csvFile.name}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Upload a CSV file with columns: borrower, amount, date, notes (optional)
              </p>
            </div>
            
            <div className="space-y-4">
              <Label className="text-base font-medium">Repayment Group Document</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  className="hidden"
                  ref={documentFileInputRef}
                  onChange={handleDocumentUpload}
                  disabled={isUploadingDocument}
                />
                <Button 
                  variant="outline"
                  onClick={handleDocumentUploadClick} 
                  disabled={isUploadingDocument}
                  className="flex-shrink-0 w-auto"
                >
                  {isUploadingDocument ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Upload the source document for this group of repayments
              </p>
              
              {documentFile && (
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <FileText className="mr-2 h-4 w-4" />
                  {documentFile.name}
                </div>
              )}
            </div>
          </div>
          
          {parsedData.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Preview ({parsedData.length} repayments)</h2>
              </div>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Borrower Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Loan ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((repayment, index) => (
                      <TableRow key={index}>
                        <TableCell>{repayment.borrowerName}</TableCell>
                        <TableCell>K{Number(repayment.amount).toFixed(2)}</TableCell>
                        <TableCell>{repayment.date}</TableCell>
                        <TableCell>{repayment.loanId || 'Not found'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            repayment.loanId 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {repayment.loanId ? 'Valid' : 'Invalid loan'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {repayment.notes ? (
                            <div className="flex items-center">
                              <FileEdit className="h-4 w-4 mr-1 text-gray-500" />
                              <span className="truncate max-w-[150px]">{repayment.notes}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No notes</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  variant="outline"
                  onClick={handleCancelUpload}
                  className="w-full md:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitRepayments} 
                  disabled={isSubmitting || !documentUrl}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit Repayments"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BulkRepayments;
