import { useState } from "react";
import { toast } from "sonner";
import { Upload, X, Download, Loader2 } from "lucide-react";
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
  gross_salary?: string;
  net_income?: string;
  interest?: string;
  loan_risk_insurance?: string;
  fortnightly_installment?: string;
  gross_loan?: string;
}

// Define a single, standard set of headers - no synonyms
const EXPECTED_HEADERS = [
  "borrower_name",
  "principal",
  "loan_term",
  "disbursement_date",
  "start_repayment_date",
  "product",
  "gross_salary",
  "net_income",
  "interest",
  "loan_risk_insurance",
  "fortnightly_installment",
  "gross_loan"
];

// Updated to match the database enum types
type InterestRateEnum = 
  | "RATE_20" | "RATE_22" | "RATE_24" | "RATE_26" | "RATE_28" | "RATE_30" 
  | "RATE_34" | "RATE_38" | "RATE_42" | "RATE_46" | "RATE_50" | "RATE_54" 
  | "RATE_58" | "RATE_62" | "RATE_66" | "RATE_70";

type BiWeeklyLoanTermEnum = 
  | "TERM_5" | "TERM_6" | "TERM_7" | "TERM_8" | "TERM_9" | "TERM_10" 
  | "TERM_12" | "TERM_14" | "TERM_16" | "TERM_18" | "TERM_20" | "TERM_22" 
  | "TERM_24" | "TERM_26" | "TERM_28" | "TERM_30";

// Updated LoanInsert to match required database fields
interface LoanInsert {
  loan_id: string; // Added to satisfy TypeScript, will be replaced by trigger
  borrower_id: string;
  principal: number;
  loan_term: BiWeeklyLoanTermEnum;
  interest: number;
  fortnightly_installment: number;
  loan_risk_insurance: number;
  documentation_fee: number;
  gross_loan: number;
  disbursement_date: string;
  start_repayment_date: string;
  loan_status: 'active';
  product: string;
  gross_salary: number;
  net_income: number;
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
          // Get actual headers from the CSV
          const actualHeaders = results.meta.fields || [];
          console.log("CSV actual headers:", actualHeaders);
          
          // Check for required headers
          const requiredHeaders = ["borrower_name", "principal", "loan_term"];
          const missingRequiredHeaders: string[] = [];
          
          for (const requiredHeader of requiredHeaders) {
            if (!actualHeaders.includes(requiredHeader)) {
              missingRequiredHeaders.push(requiredHeader);
            }
          }
          
          if (missingRequiredHeaders.length > 0) {
            setMissingHeaders(missingRequiredHeaders);
            toast.error(`Missing required headers: ${missingRequiredHeaders.join(", ")}`);
            setIsLoading(false);
            return;
          }

          const parsedData = results.data.map((row: any) => {
            const loan: CSVLoan = {
              borrower_name: row.borrower_name || '',
              principal: row.principal || '',
              loan_term: row.loan_term || '',
              disbursement_date: row.disbursement_date,
              start_repayment_date: row.start_repayment_date,
              product: row.product,
              gross_salary: row.gross_salary,
              net_income: row.net_income,
              interest: row.interest,
              loan_risk_insurance: row.loan_risk_insurance,
              fortnightly_installment: row.fortnightly_installment,
              gross_loan: row.gross_loan
            };
            
            return loan;
          });

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

  const getLoanTermEnum = (term: string): BiWeeklyLoanTermEnum => {
    const termNumber = parseInt(term, 10);
    return `TERM_${termNumber}` as BiWeeklyLoanTermEnum;
  };

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
    const nameParts = borrowerName.trim().split(' ');
    let query;
    
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      
      query = supabase
        .from('borrowers')
        .select('borrower_id')
        .ilike('given_name', `%${firstName}%`)
        .ilike('surname', `%${lastName}%`)
        .limit(1);
    } else {
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
      
      for (const loan of csvData) {
        const borrowerId = await lookupBorrowerId(loan.borrower_name);
        
        if (!borrowerId) {
          errors.push(`Borrower "${loan.borrower_name}" not found`);
          continue;
        }
        
        const principal = parseFloat(loan.principal);
        const loanTerm = parseInt(loan.loan_term);
        
        let loanValues;
        let interest = loan.interest ? parseFloat(loan.interest) : null;
        let loanRiskInsurance = loan.loan_risk_insurance ? parseFloat(loan.loan_risk_insurance) : null;
        let fortnightlyInstallment = loan.fortnightly_installment ? parseFloat(loan.fortnightly_installment) : null;
        let grossLoan = loan.gross_loan ? parseFloat(loan.gross_loan) : null;
        
        if (!interest || !loanRiskInsurance || !fortnightlyInstallment || !grossLoan) {
          loanValues = calculateLoanValues(principal, loanTerm);
          interest = loanValues.interest;
          loanRiskInsurance = loanValues.loanRiskInsurance;
          fortnightlyInstallment = loanValues.fortnightlyInstallment;
          grossLoan = loanValues.grossLoan;
        }
        
        const loanTermEnum = getLoanTermEnum(loan.loan_term);
        
        const grossSalary = loan.gross_salary ? parseFloat(loan.gross_salary) : 0;
        const netIncome = loan.net_income ? parseFloat(loan.net_income) : 0;
        const disbursementDate = loan.disbursement_date || new Date().toISOString().split('T')[0];
        const startRepaymentDate = loan.start_repayment_date || disbursementDate;
        const product = loan.product || "Others";

        loansToInsert.push({
          loan_id: "temporary_id", // This will be overwritten by the database trigger
          borrower_id: borrowerId,
          principal: principal,
          loan_term: loanTermEnum,
          fortnightly_installment: fortnightlyInstallment,
          interest: interest,
          loan_risk_insurance: loanRiskInsurance,
          documentation_fee: 50,
          gross_loan: grossLoan,
          disbursement_date: disbursementDate,
          start_repayment_date: startRepaymentDate,
          loan_status: 'active',
          product: product,
          gross_salary: grossSalary,
          net_income: netIncome,
        });
      }

      if (errors.length > 0) {
        setBorrowerLookupError(`Failed to look up ${errors.length} borrowers. The first few errors: ${errors.slice(0, 3).join(", ")}${errors.length > 3 ? "..." : ""}`);
        if (loansToInsert.length === 0) {
          throw new Error("No valid loans to insert");
        }
        toast.warning(`Some borrowers could not be found. Continuing with ${loansToInsert.length} valid loans.`);
      }

      console.log("Loans to insert:", loansToInsert);

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
    const headers = EXPECTED_HEADERS.join(',');
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
            <p className="text-muted-foreground">
              Upload a CSV file with the following columns: 
              <span className="font-semibold"> borrower_name</span>*, 
              <span className="font-semibold"> principal</span>*, 
              <span className="font-semibold"> loan_term</span>*,
              disbursement_date, start_repayment_date, product, gross_salary, net_income,
              interest, loan_risk_insurance, fortnightly_installment, gross_loan
            </p>
            
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
                variant="outline"
                onClick={downloadTemplateCSV}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
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
                      <TableHead>Interest</TableHead>
                      <TableHead>Loan Risk Insurance</TableHead>
                      <TableHead>Bi-Weekly Repayment</TableHead>
                      <TableHead>Gross Loan</TableHead>
                      <TableHead>Disbursement Date</TableHead>
                      <TableHead>Start Repayment Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Gross Salary</TableHead>
                      <TableHead>Net Income</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((loan, index) => (
                      <TableRow key={index}>
                        <TableCell>{loan.borrower_name}</TableCell>
                        <TableCell>K{parseFloat(loan.principal).toFixed(2)}</TableCell>
                        <TableCell>{loan.loan_term} periods</TableCell>
                        <TableCell>K{loan.interest ? parseFloat(loan.interest).toFixed(2) : '-'}</TableCell>
                        <TableCell>K{loan.loan_risk_insurance ? parseFloat(loan.loan_risk_insurance).toFixed(2) : '-'}</TableCell>
                        <TableCell>K{loan.fortnightly_installment ? parseFloat(loan.fortnightly_installment).toFixed(2) : '-'}</TableCell>
                        <TableCell>K{loan.gross_loan ? parseFloat(loan.gross_loan).toFixed(2) : '-'}</TableCell>
                        <TableCell>{loan.disbursement_date || 'Today'}</TableCell>
                        <TableCell>{loan.start_repayment_date || loan.disbursement_date || 'Today'}</TableCell>
                        <TableCell>{loan.product || 'Others'}</TableCell>
                        <TableCell>{loan.gross_salary ? `K${parseFloat(loan.gross_salary).toFixed(2)}` : '-'}</TableCell>
                        <TableCell>{loan.net_income ? `K${parseFloat(loan.net_income).toFixed(2)}` : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="w-full md:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={csvData.length === 0 || isLoading}
                  className="w-full md:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : "Submit Loans"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BulkLoans;
