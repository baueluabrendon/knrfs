
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload } from "lucide-react";

interface LoanData {
  id: string;
  borrowerId: string;
  amount: number;
  term: number;
  interestRate: number;
  startDate: string;
}

const BulkLoans = () => {
  const [parsedData, setParsedData] = useState<LoanData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log("File uploaded:", file.name);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Bulk Loan Upload</h1>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button onClick={handleUploadClick}>
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </Button>
          </div>
          
          {parsedData.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan ID</TableHead>
                      <TableHead>Borrower ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Term (months)</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Start Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.id}</TableCell>
                        <TableCell>{loan.borrowerId}</TableCell>
                        <TableCell>${loan.amount.toFixed(2)}</TableCell>
                        <TableCell>{loan.term}</TableCell>
                        <TableCell>{loan.interestRate}%</TableCell>
                        <TableCell>{new Date(loan.startDate).toLocaleDateString()}</TableCell>
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
