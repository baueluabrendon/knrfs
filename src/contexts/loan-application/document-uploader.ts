import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, FileText, Loader2, Upload as UploadIcon } from "lucide-react";
import { uploadGroupRepaymentDocument } from "@/contexts/loan-application/document-uploader";
import { Repayment } from "@/types/repayment";

interface RepaymentData {
  date: string;
  amount: number;
  loanId: string;
  borrowerName: string;
  payPeriod: string;
}

const BulkRepayments = () => {
  const [parsedData, setParsedData] = useState<RepaymentData[]>([]);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const documentFileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingCSV(true);
    
    // Read the CSV file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseCSV(text);
        setParsedData(result);
        toast.success("CSV file parsed successfully");
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to parse CSV file. Please check the format.");
      } finally {
        setIsUploadingCSV(false);
      }
    };
    
    reader.onerror = () => {
      toast.error("Error reading file");
      setIsUploadingCSV(false);
    };
    
    reader.readAsText(file);
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingDocument(true);
    setDocumentFile(file);

    try {
      // Upload the document to storage
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

  const parseCSV = (text: string): RepaymentData[] => {
    // Simple CSV parsing (could be enhanced with a library like papaparse)
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Validate required headers
    const requiredHeaders = ['date', 'amount', 'loanId', 'borrowerName', 'payPeriod'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    // Parse data rows
    return lines.slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = line.split(',').map(value => value.trim());
        const data: any = {};
        
        headers.forEach((header, index) => {
          if (header === 'amount') {
            data[header] = parseFloat(values[index]);
          } else {
            data[header] = values[index];
          }
        });
        
        return data as RepaymentData;
      });
  };

  const handleUploadRepayments = () => {
    if (!parsedData.length) {
      toast.error("Please upload and parse CSV data first");
      return;
    }
    
    if (!documentUrl) {
      toast.error("Please upload the repayment group document first");
      return;
    }
    
    // This would eventually integrate with an API to upload the repayment data
    toast.success("Repayments uploaded to the system");
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
      // Here you would implement the logic to submit the repayments to your backend
      // For now we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Successfully processed ${parsedData.length} repayments`);
      setParsedData([]);
      setDocumentFile(null);
      setDocumentUrl(null);
      
      // Reset the file inputs
      if (csvFileInputRef.current) csvFileInputRef.current.value = '';
      if (documentFileInputRef.current) documentFileInputRef.current.value = '';
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
                  onChange={handleCSVUpload}
                  disabled={isUploadingCSV}
                />
                <Button 
                  variant="outline"
                  onClick={handleCSVUploadClick} 
                  disabled={isUploadingCSV}
                  className="flex-shrink-0 w-auto"
                >
                  {isUploadingCSV ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload CSV
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleUploadRepayments}
                  disabled={!parsedData.length || !documentUrl || isSubmitting}
                  className="flex-shrink-0 w-auto"
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload Repayments
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Upload a CSV file with columns: date, amount, loanId, borrowerName, payPeriod
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
              <h2 className="text-lg font-semibold mb-4">Preview ({parsedData.length} repayments)</h2>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Loan ID</TableHead>
                      <TableHead>Borrower Name</TableHead>
                      <TableHead>Pay Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((repayment, index) => (
                      <TableRow key={index}>
                        <TableCell>{repayment.date}</TableCell>
                        <TableCell>${repayment.amount.toFixed(2)}</TableCell>
                        <TableCell>{repayment.loanId}</TableCell>
                        <TableCell>{repayment.borrowerName}</TableCell>
                        <TableCell>{repayment.payPeriod}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 flex justify-end">
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
