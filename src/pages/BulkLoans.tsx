
import { useState } from "react";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateLoanValues } from "@/utils/loanCalculations";

interface CSVLoan {
  borrower_id: string;
  principal: string;
  loan_term: string;
  disbursement_date?: string;
}

interface LoanInsert {
  borrower_id: string;
  principal: number;
  loan_term: string;
  interest: number;
  interest_rate: string;
  fortnightly_installment: number;
  loan_risk_insurance: number;
  documentation_fee: number;
  gross_loan: number;
  disbursement_date?: string;
  maturity_date?: string;
  loan_status: string;
}

const BulkLoans = () => {
  const [csvData, setCSVData] = useState<CSVLoan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error("Papa Parse errors:", results.errors);
          toast.error("Error parsing CSV file");
          setIsLoading(false);
          return;
        }

        try {
          const parsedData = results.data.map((row: any) => ({
            borrower_id: row.borrower_id || "",
            principal: row.principal || "",
            loan_term: row.loan_term || "",
            disbursement_date: row.disbursement_date || "",
          }));

          setCSVData(parsedData);
          toast.success(`Successfully parsed ${parsedData.length} loans`);
        } catch (error) {
          console.error("Error processing CSV data:", error);
          toast.error("Error processing CSV data");
        } finally {
          setIsLoading(false);
        }
      },
      error: (error) => {
        console.error("Papa Parse error:", error);
        toast.error("Failed to parse CSV file");
        setIsLoading(false);
      }
    });
  };

  const handleSubmit = async () => {
    if (csvData.length === 0) {
      toast.error("Please upload a CSV file first");
      return;
    }

    setIsLoading(true);
    
    try {
      const loansToInsert: LoanInsert[] = csvData.map(loan => {
        const principal = parseFloat(loan.principal);
        const loanTerm = parseInt(loan.loan_term);
        
        // Calculate additional loan values
        const loanValues = calculateLoanValues(principal, loanTerm);
        
        // Determine the loan term enum value
        const loanTermEnum = `TERM_${loanTerm}`;
        
        // Calculate maturity date by adding (loanTerm * 14) days from disbursement date or today
        const startDate = loan.disbursement_date ? new Date(loan.disbursement_date) : new Date();
        const maturityDate = new Date(startDate);
        maturityDate.setDate(maturityDate.getDate() + (loanTerm * 14));
        
        return {
          borrower_id: loan.borrower_id,
          principal: principal,
          loan_term: loanTermEnum as any,
          fortnightly_installment: loanValues.fortnightlyInstallment,
          interest: loanValues.interest,
          interest_rate: `RATE_${Math.round(loanValues.interestRate * 100)}` as any,
          loan_risk_insurance: loanValues.loanRiskInsurance,
          documentation_fee: loanValues.documentationFee,
          gross_loan: loanValues.grossLoan,
          disbursement_date: loan.disbursement_date || new Date().toISOString().split('T')[0],
          maturity_date: maturityDate.toISOString().split('T')[0],
          loan_status: 'active',
        };
      });

      const batchSize = 20;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < loansToInsert.length; i += batchSize) {
        const batch = loansToInsert.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('loans')
          .insert(batch)
          .select();
        
        if (error) {
          console.error("Error inserting loans:", error);
          errorCount += batch.length;
        } else {
          console.log("Successfully inserted loans:", data);
          successCount += data.length;
        }
      }

      if (errorCount > 0) {
        toast.warning(`Added ${successCount} loans with ${errorCount} errors`);
      } else {
        toast.success(`Successfully added ${successCount} loans`);
      }
      
      setCSVData([]);
    } catch (error) {
      console.error("Error in bulk upload:", error);
      toast.error("Failed to upload loans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCSVData([]);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bulk Loan Upload</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <p className="text-muted-foreground mb-2">
              Upload a CSV file with the following columns: borrower_id, principal, loan_term, disbursement_date (optional)
            </p>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="relative"
                disabled={isLoading}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="mr-2 h-4 w-4" />
                Select CSV File
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={csvData.length === 0 || isLoading}
              >
                {isLoading ? "Uploading..." : "Upload Loans"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>

          {csvData.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Preview ({csvData.length} loans)</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Borrower ID</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Loan Term</TableHead>
                      <TableHead>Disbursement Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((loan, index) => (
                      <TableRow key={index}>
                        <TableCell>{loan.borrower_id}</TableCell>
                        <TableCell>${parseFloat(loan.principal).toFixed(2)}</TableCell>
                        <TableCell>{loan.loan_term} periods</TableCell>
                        <TableCell>{loan.disbursement_date || 'Today'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BulkLoans;
