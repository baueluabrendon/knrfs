
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { loansApi } from "@/lib/api/loans";
import Papa from "papaparse";
import { Loader2, Upload } from "lucide-react";

type LoanData = {
  loan_id?: string;
  borrower_id: string;
  principal: number;
  gross_loan: number;
  fortnightly_installment: number;
  loan_term: string;
  interest_rate?: string;
  loan_risk_insurance: number;
  documentation_fee: number;
  gross_salary: number;
  net_income: number;
  start_repayment_date: string;
  disbursement_date: string;
};

interface HeaderMapping {
  [key: string]: string;
}

const BulkLoans = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setValidationErrors([]);
    }
  };

  const validateCsvData = (data: any[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const requiredFields = [
      "borrower_id",
      "principal",
      "gross_loan",
      "fortnightly_installment",
      "loan_term",
      "loan_risk_insurance",
      "documentation_fee",
      "gross_salary",
      "net_income",
      "start_repayment_date",
      "disbursement_date",
    ];

    if (data.length === 0) {
      errors.push("CSV file is empty");
      return { valid: false, errors };
    }

    // Check header existence
    const headers = Object.keys(data[0]);
    for (const field of requiredFields) {
      // Use normalized header mapping to check
      const fieldExists = headers.some(header => 
        normalizeHeaderName(header) === field
      );
      
      if (!fieldExists) {
        errors.push(`Missing required column: ${field}`);
      }
    }

    // Validate each row
    data.forEach((row: any, index: number) => {
      // Check if borrower_id exists and is not empty
      if (!row.borrower_id || row.borrower_id.trim() === "") {
        errors.push(`Row ${index + 1}: Missing borrower_id`);
      }

      // Validate numeric fields
      const numericFields = ["principal", "gross_loan", "fortnightly_installment", "loan_risk_insurance", 
                            "documentation_fee", "gross_salary", "net_income"];
      
      numericFields.forEach(field => {
        const value = row[field];
        if (value === undefined || value === null || isNaN(Number(value))) {
          errors.push(`Row ${index + 1}: Invalid ${field} value`);
        }
      });

      // Validate date fields
      const dateFields = ["start_repayment_date", "disbursement_date"];
      dateFields.forEach(field => {
        if (!row[field] || !isValidDate(row[field])) {
          errors.push(`Row ${index + 1}: Invalid ${field} date format`);
        }
      });
    });

    return { valid: errors.length === 0, errors };
  };

  const isValidDate = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const normalizeHeaderName = (header: string): string => {
    if (typeof header !== 'string') {
      console.error('Header is not a string:', header);
      return '';
    }

    const normalized = header.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    // Map common variations to standard field names
    const headerMapping: HeaderMapping = {
      'gross_loan': 'gross_loan',
      'grossloan': 'gross_loan',
      'gross': 'gross_loan',
      'fortnightly_installment': 'fortnightly_installment',
      'fortnightlyinstallment': 'fortnightly_installment',
      'installment': 'fortnightly_installment',
      'biweekly_installment': 'fortnightly_installment',
      'fortnightly_payment': 'fortnightly_installment',
      'biweekly_payment': 'fortnightly_installment',
      'gross_salary': 'gross_salary',
      'grosssalary': 'gross_salary',
      'salary': 'gross_salary',
      'annual_salary': 'gross_salary',
      'net_income': 'net_income',
      'netincome': 'net_income',
      'net': 'net_income',
      'take_home_pay': 'net_income',
      'borrower_id': 'borrower_id',
      'borrowerid': 'borrower_id',
      'customer_id': 'borrower_id',
      'customerid': 'borrower_id',
      'principal': 'principal',
      'loan_amount': 'principal',
      'amount': 'principal',
    };

    return headerMapping[normalized] || normalized;
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    setValidationErrors([]);

    try {
      const result = await new Promise<Papa.ParseResult<unknown>>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject
        });
      });

      // Create a new array with normalized headers
      const processedData = result.data.map((row: any) => {
        const newRow: Record<string, any> = {};
        
        Object.entries(row).forEach(([key, value]) => {
          const normalizedKey = normalizeHeaderName(key);
          if (normalizedKey) {
            newRow[normalizedKey] = value;
          }
        });
        
        return newRow;
      });

      const { valid, errors } = validateCsvData(processedData);
      
      if (!valid) {
        setValidationErrors(errors);
        toast.error("Validation failed. Please fix the errors and try again.");
        setUploading(false);
        return;
      }

      // Format data according to API requirements
      const formattedData = processedData.map((row: any) => ({
        borrower_id: row.borrower_id,
        principal: Number(row.principal),
        gross_loan: Number(row.gross_loan),
        fortnightly_installment: Number(row.fortnightly_installment),
        loan_term: row.loan_term,
        loan_risk_insurance: Number(row.loan_risk_insurance),
        documentation_fee: Number(row.documentation_fee),
        gross_salary: Number(row.gross_salary),
        net_income: Number(row.net_income),
        start_repayment_date: row.start_repayment_date,
        disbursement_date: row.disbursement_date
      }));

      await loansApi.uploadBulkLoans(file);
      toast.success("Loans uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload loans");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bulk Upload Loans</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium mb-2">Upload CSV File</h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload a CSV file containing loan data. The file must include the following columns:
              borrower_id, principal, gross_loan, fortnightly_installment, loan_term, loan_risk_insurance,
              documentation_fee, gross_salary, net_income, start_repayment_date, disbursement_date.
            </p>
            
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="max-w-md"
              />
              <Button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="mt-4 p-4 border border-red-200 rounded bg-red-50">
              <h3 className="text-red-700 font-medium mb-2">Validation Errors:</h3>
              <ul className="list-disc pl-5 text-red-600 text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">CSV Format Example</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">borrower_id</th>
                    <th className="border px-4 py-2">principal</th>
                    <th className="border px-4 py-2">gross_loan</th>
                    <th className="border px-4 py-2">fortnightly_installment</th>
                    <th className="border px-4 py-2">loan_term</th>
                    <th className="border px-4 py-2">loan_risk_insurance</th>
                    <th className="border px-4 py-2">documentation_fee</th>
                    <th className="border px-4 py-2">gross_salary</th>
                    <th className="border px-4 py-2">net_income</th>
                    <th className="border px-4 py-2">start_repayment_date</th>
                    <th className="border px-4 py-2">disbursement_date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">k&r 0000123</td>
                    <td className="border px-4 py-2">1000</td>
                    <td className="border px-4 py-2">1200</td>
                    <td className="border px-4 py-2">120</td>
                    <td className="border px-4 py-2">TERM_10</td>
                    <td className="border px-4 py-2">50</td>
                    <td className="border px-4 py-2">50</td>
                    <td className="border px-4 py-2">3000</td>
                    <td className="border px-4 py-2">2500</td>
                    <td className="border px-4 py-2">2025-01-15</td>
                    <td className="border px-4 py-2">2025-01-01</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BulkLoans;
