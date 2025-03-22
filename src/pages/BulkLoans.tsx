
import { useState } from "react";
import { toast } from "sonner";
import { Upload, X, Download } from "lucide-react";
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

// CSV expected structure
interface CSVLoan {
  borrower_name: string;
  principal: string;
  loan_term: string;
  disbursement_date?: string;
  start_repayment_date?: string;
  product?: string;
}

// Expected CSV headers mapping
const CSV_HEADERS = {
  borrower_name: "borrower_name",
  principal: "principal",
  loan_term: "loan_term",
  disbursement_date: "disbursement_date",
  start_repayment_date: "start_repayment_date",
  product: "product"
};

// Updated to match the database enum types
type InterestRateEnum = 
  | "RATE_20" | "RATE_22" | "RATE_24" | "RATE_26" | "RATE_28" | "RATE_30" 
  | "RATE_34" | "RATE_38" | "RATE_42" | "RATE_46" | "RATE_50" | "RATE_54" 
  | "RATE_58" | "RATE_62" | "RATE_66" | "RATE_70";

type BiWeeklyLoanTermEnum = 
  | "TERM_5" | "TERM_6" | "TERM_7" | "TERM_8" | "TERM_9" | "TERM_10" 
  | "TERM_12" | "TERM_14" | "TERM_16" | "TERM_18" | "TERM_20" | "TERM_22" 
  | "TERM_24" | "TERM_26" | "TERM_28" | "TERM_30";

interface LoanInsert {
  borrower_id: string;
  principal: number;
  loan_term: BiWeeklyLoanTermEnum;
  interest: number;
  interest_rate: InterestRateEnum;
  fortnightly_installment: number;
  loan_risk_insurance: number;
  documentation_fee: number;
  gross_loan: number;
  disbursement_date?: string;
  start_repayment_date?: string;
  maturity_date?: string;
  loan_status: 'active';
  product?: string;
}

const BulkLoans = () => {
  const [csvData, setCSVData] = useState<CSVLoan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [missingHeaders, setMissingHeaders] = useState<string[]>([]);
  const [borrowerLookupError, setBorrowerLookupError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsLoading(true);
    setMissingHeaders([]);
    setBorrowerLookupError(null);

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
          // Check for required headers
          const headers = results.meta.fields || [];
          const requiredHeaders = ["borrower_name", "principal", "loan_term"];
          const missingRequiredHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingRequiredHeaders.length > 0) {
            setMissingHeaders(missingRequiredHeaders);
            toast.error(`Missing required headers: ${missingRequiredHeaders.join(", ")}`);
            setIsLoading(false);
            return;
          }

          const parsedData = results.data.map((row: any) => ({
            borrower_name: row[CSV_HEADERS.borrower_name] || "",
            principal: row[CSV_HEADERS.principal] || "",
            loan_term: row[CSV_HEADERS.loan_term] || "",
            disbursement_date: row[CSV_HEADERS.disbursement_date] || "",
            start_repayment_date: row[CSV_HEADERS.start_repayment_date] || "",
            product: row[CSV_HEADERS.product] || "",
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

  // Helper function to convert loan term to enum value
  const getLoanTermEnum = (term: string): BiWeeklyLoanTermEnum => {
    const termNumber = parseInt(term, 10);
    return `TERM_${termNumber}` as BiWeeklyLoanTermEnum;
  };

  // Helper function to get interest rate enum value based on loan term
  const getInterestRateEnum = (loanTerm: BiWeeklyLoanTermEnum): InterestRateEnum => {
    const rateMap: Record<BiWeeklyLoanTermEnum, InterestRateEnum> = {
      'TERM_5': 'RATE_20',
      'TERM_6': 'RATE_22',
      'TERM_7': 'RATE_24',
      'TERM_8': 'RATE_26',
      'TERM_9': 'RATE_28',
      'TERM_10': 'RATE_30',
      'TERM_12': 'RATE_34',
      'TERM_14': 'RATE_38',
      'TERM_16': 'RATE_42',
      'TERM_18': 'RATE_46',
      'TERM_20': 'RATE_50',
      'TERM_22': 'RATE_54',
      'TERM_24': 'RATE_58',
      'TERM_26': 'RATE_62',
      'TERM_28': 'RATE_66',
      'TERM_30': 'RATE_70'
    };
    return rateMap[loanTerm];
  };

  const lookupBorrowerId = async (borrowerName: string): Promise<string | null> => {
    // Split the name into parts
    const nameParts = borrowerName.trim().split(' ');
    let query;
    
    if (nameParts.length >= 2) {
      // If we have at least first and last name
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      
      // Try to match on given_name and surname
      query = supabase
        .from('borrowers')
        .select('borrower_id')
        .ilike('given_name', `%${firstName}%`)
        .ilike('surname', `%${lastName}%`)
        .limit(1);
    } else {
      // If we only have one name part, try to match on either given_name or surname
      query = supabase
        .from('borrowers')
        .select('borrower_id')
        .or(`given_name.ilike.%${borrowerName}%,surname.ilike.%${borrowerName}%`)
        .limit(1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error looking up borrower:", error);
      return null;
    }
    
    return data.length > 0 ? data[0].borrower_id : null;
  };

  const handleSubmit = async () => {
    if (csvData.length === 0) {
      toast.error("Please upload a CSV file first");
      return;
    }

    setIsLoading(true);
    setBorrowerLookupError(null);
    
    try {
      const loansToInsert: LoanInsert[] = [];
      const errors: string[] = [];
      
      // First, process each loan entry and look up borrower IDs
      for (const loan of csvData) {
        const borrowerId = await lookupBorrowerId(loan.borrower_name);
        
        if (!borrowerId) {
          errors.push(`Borrower "${loan.borrower_name}" not found`);
          continue;
        }
        
        const principal = parseFloat(loan.principal);
        const loanTerm = parseInt(loan.loan_term);
        
        // Calculate additional loan values
        const loanValues = calculateLoanValues(principal, loanTerm);
        
        // Determine the loan term enum value
        const loanTermEnum = getLoanTermEnum(loan.loan_term);
        const interestRateEnum = getInterestRateEnum(loanTermEnum);
        
        // Calculate maturity date by adding (loanTerm * 14) days from disbursement date or today
        const startDate = loan.disbursement_date ? new Date(loan.disbursement_date) : new Date();
        const maturityDate = new Date(startDate);
        maturityDate.setDate(maturityDate.getDate() + (loanTerm * 14));
        
        loansToInsert.push({
          borrower_id: borrowerId,
          principal: principal,
          loan_term: loanTermEnum,
          fortnightly_installment: loanValues.fortnightlyInstallment,
          interest: loanValues.interest,
          interest_rate: interestRateEnum,
          loan_risk_insurance: loanValues.loanRiskInsurance,
          documentation_fee: loanValues.documentationFee,
          gross_loan: loanValues.grossLoan,
          disbursement_date: loan.disbursement_date || new Date().toISOString().split('T')[0],
          start_repayment_date: loan.start_repayment_date || loan.disbursement_date || new Date().toISOString().split('T')[0],
          maturity_date: maturityDate.toISOString().split('T')[0],
          loan_status: 'active',
          product: loan.product || "Others",
        });
      }

      if (errors.length > 0) {
        setBorrowerLookupError(`Failed to look up ${errors.length} borrowers. The first few errors: ${errors.slice(0, 3).join(", ")}${errors.length > 3 ? "..." : ""}`);
        if (loansToInsert.length === 0) {
          throw new Error("No valid loans to insert");
        }
        toast.warning(`Some borrowers could not be found. Continuing with ${loansToInsert.length} valid loans.`);
      }

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
    setMissingHeaders([]);
    setBorrowerLookupError(null);
    setIsLoading(false);
  };

  const downloadTemplateCSV = () => {
    const headers = Object.values(CSV_HEADERS).join(',');
    const csvContent = `${headers}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'loan_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bulk Loan Upload</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Upload a CSV file with the following columns: 
                <span className="font-semibold"> borrower_name</span>*, 
                <span className="font-semibold"> principal</span>*, 
                <span className="font-semibold"> loan_term</span>*,
                disbursement_date, start_repayment_date, product
              </p>
              <Button
                variant="outline"
                onClick={downloadTemplateCSV}
                className="ml-2"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
            
            {missingHeaders.length > 0 && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md my-2">
                <p className="font-semibold">Missing required CSV headers:</p>
                <ul className="list-disc list-inside">
                  {missingHeaders.map(header => (
                    <li key={header}>{header}</li>
                  ))}
                </ul>
              </div>
            )}

            {borrowerLookupError && (
              <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md my-2">
                <p className="font-semibold">Borrower Lookup Issues:</p>
                <p>{borrowerLookupError}</p>
              </div>
            )}
            
            <div className="flex items-center space-x-4 mt-4">
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
                      <TableHead>Borrower Name</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Loan Term</TableHead>
                      <TableHead>Disbursement Date</TableHead>
                      <TableHead>Start Repayment Date</TableHead>
                      <TableHead>Product</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((loan, index) => (
                      <TableRow key={index}>
                        <TableCell>{loan.borrower_name}</TableCell>
                        <TableCell>${parseFloat(loan.principal).toFixed(2)}</TableCell>
                        <TableCell>{loan.loan_term} periods</TableCell>
                        <TableCell>{loan.disbursement_date || 'Today'}</TableCell>
                        <TableCell>{loan.start_repayment_date || loan.disbursement_date || 'Today'}</TableCell>
                        <TableCell>{loan.product || 'Others'}</TableCell>
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
