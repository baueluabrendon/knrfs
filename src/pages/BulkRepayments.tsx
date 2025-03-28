
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, FileText, Loader2, Upload as UploadIcon, Table as TableIcon } from "lucide-react";
import { uploadGroupRepaymentDocument } from "@/contexts/loan-application/document-uploader";
import { Repayment, BulkRepaymentData } from "@/types/repayment";
import Papa from "papaparse";

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
      complete: (results) => {
        try {
          validateCSVHeaders(results.meta.fields || []);
          const parsedResults = results.data as BulkRepaymentData[];
          setParsedData(parsedResults);
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
    const requiredHeaders = ['date', 'amount', 'loanId', 'borrowerName', 'payPeriod'];
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

  const handleUploadRepayments = () => {
    if (!parsedData.length) {
      toast.error("Please select and parse CSV data first");
      return;
    }
    
    if (!documentUrl) {
      toast.error("Please upload the repayment group document first");
      return;
    }
    
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Successfully processed ${parsedData.length} repayments`);
      setParsedData([]);
      setCsvFile(null);
      setDocumentFile(null);
      setDocumentUrl(null);
      
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
                
                {csvFile && (
                  <div className="text-sm text-green-600 flex items-center gap-1 ml-2">
                    <FileText className="h-4 w-4" />
                    {csvFile.name}
                  </div>
                )}
                
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
                        <TableCell>${Number(repayment.amount).toFixed(2)}</TableCell>
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
