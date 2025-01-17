import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
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

interface CSVBorrower {
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  monthlyIncome: string;
}

const BulkBorrowers = () => {
  const [csvData, setCSVData] = useState<CSVBorrower[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(header => header.trim());
      
      const parsedData: CSVBorrower[] = lines
        .slice(1)
        .filter(line => line.trim() !== "")
        .map(line => {
          const values = line.split(",").map(value => value.trim());
          return {
            name: values[0] || "",
            email: values[1] || "",
            phone: values[2] || "",
            address: values[3] || "",
            occupation: values[4] || "",
            monthlyIncome: values[5] || "0",
          };
        });

      setCSVData(parsedData);
      setIsLoading(false);
      toast.success(`Successfully parsed ${parsedData.length} borrowers`);
    };

    reader.onerror = () => {
      setIsLoading(false);
      toast.error("Error reading file");
    };

    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (csvData.length === 0) {
      toast.error("Please upload a CSV file first");
      return;
    }

    setIsLoading(true);
    // Here you would typically send the data to your backend
    console.log("Borrowers to be created:", csvData);
    toast.success("Bulk borrowers uploaded successfully");
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bulk Borrower Upload</h1>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
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
                Upload Borrowers
              </Button>
            </div>

            {csvData.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">Preview</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Occupation</TableHead>
                        <TableHead>Monthly Income</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.map((borrower, index) => (
                        <TableRow key={index}>
                          <TableCell>{borrower.name}</TableCell>
                          <TableCell>{borrower.email}</TableCell>
                          <TableCell>{borrower.phone}</TableCell>
                          <TableCell>{borrower.address}</TableCell>
                          <TableCell>{borrower.occupation}</TableCell>
                          <TableCell>${borrower.monthlyIncome}</TableCell>
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
    </DashboardLayout>
  );
};

export default BulkBorrowers;