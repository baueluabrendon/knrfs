
import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

// Updated interface to match borrowers table columns
interface CSVBorrower {
  surname: string;
  given_name: string;
  email: string;
  mobile_number: string;
  postal_address: string;
  position: string;
  department_company: string;
  work_phone_number: string;
}

// Match the database structure
interface BorrowerInsert {
  surname: string;
  given_name: string;
  email: string;
  mobile_number: string | null;
  postal_address: string | null;
  position: string | null;
  department_company: string | null;
  work_phone_number: string | null;
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
            surname: values[0] || "",
            given_name: values[1] || "",
            email: values[2] || "",
            mobile_number: values[3] || "",
            postal_address: values[4] || "",
            position: values[5] || "",
            department_company: values[6] || "",
            work_phone_number: values[7] || "",
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
    
    try {
      // Convert CSV data to the format expected by the borrowers table
      const borrowersToInsert: BorrowerInsert[] = csvData.map(borrower => {
        return {
          surname: borrower.surname,
          given_name: borrower.given_name,
          email: borrower.email,
          mobile_number: borrower.mobile_number || null,
          postal_address: borrower.postal_address || null,
          position: borrower.position || null,
          department_company: borrower.department_company || null,
          work_phone_number: borrower.work_phone_number || null,
        };
      });

      // Insert the borrowers into the database in batches
      const batchSize = 20;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < borrowersToInsert.length; i += batchSize) {
        const batch = borrowersToInsert.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('borrowers')
          .insert(batch)
          .select();
        
        if (error) {
          console.error("Error inserting borrowers:", error);
          errorCount += batch.length;
        } else {
          console.log("Successfully inserted borrowers:", data);
          successCount += data.length;
        }
      }

      if (errorCount > 0) {
        toast.warning(`Added ${successCount} borrowers with ${errorCount} errors`);
      } else {
        toast.success(`Successfully added ${successCount} borrowers`);
      }
      
      // Clear the data after successful insertion
      setCSVData([]);
    } catch (error) {
      console.error("Error in bulk upload:", error);
      toast.error("Failed to upload borrowers");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bulk Borrower Upload</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <p className="text-muted-foreground mb-2">
              Upload a CSV file with the following columns: Surname, Given Name, Email, Mobile Number, Postal Address, Position, Department/Company, Work Phone Number
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
                {isLoading ? "Uploading..." : "Upload Borrowers"}
              </Button>
            </div>
          </div>

          {csvData.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Preview ({csvData.length} borrowers)</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Surname</TableHead>
                      <TableHead>Given Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile Number</TableHead>
                      <TableHead>Postal Address</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department/Company</TableHead>
                      <TableHead>Work Phone Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((borrower, index) => (
                      <TableRow key={index}>
                        <TableCell>{borrower.surname}</TableCell>
                        <TableCell>{borrower.given_name}</TableCell>
                        <TableCell>{borrower.email}</TableCell>
                        <TableCell>{borrower.mobile_number}</TableCell>
                        <TableCell>{borrower.postal_address}</TableCell>
                        <TableCell>{borrower.position}</TableCell>
                        <TableCell>{borrower.department_company}</TableCell>
                        <TableCell>{borrower.work_phone_number}</TableCell>
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

export default BulkBorrowers;
