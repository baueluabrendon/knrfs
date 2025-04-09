import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Loader2, TableIcon, Download } from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { BulkRepaymentData } from "@/types/repayment";

interface CSVUploadProps {
  onParsedData: (data: BulkRepaymentData[]) => void;
  csvFile: File | null;
  setCsvFile: (file: File | null) => void;
  isParsingCSV: boolean;
  setIsParsingCSV: (isParsingCSV: boolean) => void;
}

const CSVUpload = ({
  onParsedData,
  csvFile,
  setCsvFile,
  isParsingCSV,
  setIsParsingCSV
}: CSVUploadProps) => {
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const validateCSVHeaders = (headers: string[]) => {
    const requiredHeaders = ['borrower', 'amount', 'payment_date'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
  };

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
            const payment_date = row.payment_date;
            const notes = row.notes || '';
            
            if (!borrowerName || isNaN(amount) || !payment_date) {
              continue;
            }
            
            let loan_id = '';
            
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
                  loan_id = loanData[0].loan_id;
                }
              }
            }
            
            processedData.push({
              borrowerName,
              amount,
              payment_date,
              loan_id,
              status: loan_id ? 'pending' : 'failed',
              notes
            });
          }
          
          onParsedData(processedData);
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

  const handleCSVUploadClick = () => {
    if (csvFileInputRef.current) {
      csvFileInputRef.current.click();
    }
  };

  const downloadCSVTemplate = () => {
    const headers = "borrower,amount,payment_date,notes\n";
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
        Upload a CSV file with columns: borrower, amount, payment_date, notes (optional)
      </p>
    </div>
  );
};

export default CSVUpload;
