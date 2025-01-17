import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BulkLoan {
  borrowerName: string;
  amount: number;
  interestRate: number;
  term: number;
}

const BulkLoans = () => {
  const [csvData, setCsvData] = useState<BulkLoan[]>([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        const parsedData: BulkLoan[] = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            borrowerName: values[0],
            amount: parseFloat(values[1]),
            interestRate: parseFloat(values[2]),
            term: parseInt(values[3]),
          };
        });

        setCsvData(parsedData);
        setIsPreviewVisible(true);
        toast({
          title: "File Uploaded",
          description: "CSV file has been successfully parsed.",
        });
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    // Here you would typically send the data to your API
    console.log('Submitting bulk loans:', csvData);
    toast({
      title: "Success",
      description: "Bulk loans have been successfully processed.",
    });
    setCsvData([]);
    setIsPreviewVisible(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Add Bulk Loans</h1>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="max-w-md"
              />
              <Button onClick={() => document.querySelector('input[type="file"]')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
            </div>
            
            {isPreviewVisible && csvData.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Preview</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Borrower Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Term (months)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((loan, index) => (
                      <TableRow key={index}>
                        <TableCell>{loan.borrowerName}</TableCell>
                        <TableCell>${loan.amount.toLocaleString()}</TableCell>
                        <TableCell>{loan.interestRate}%</TableCell>
                        <TableCell>{loan.term}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end">
                  <Button onClick={handleSubmit}>Process Bulk Loans</Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BulkLoans;