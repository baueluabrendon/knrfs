import { useState } from "react";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
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

interface CSVBorrower {
  surname: string;
  given_name: string;
  email: string;
  mobile_number: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  village: string;
  district: string;
  province: string;
  postal_address: string;
  lot: string;
  section: string;
  suburb: string;
  street_name: string;
  department_company: string;
  position: string;
  date_employed: string;
  work_phone_number: string;
  file_number: string;
  paymaster: string;
  company_branch: string;
  fax: string;
  marital_status: string;
  spouse_last_name: string;
  spouse_first_name: string;
  spouse_employer_name: string;
  spouse_contact_details: string;
  bank: string;
  bank_branch: string;
  bsb_code: string;
  account_name: string;
  account_number: string;
  account_type: string;
}

interface BorrowerInsert {
  surname: string;
  given_name: string;
  email: string;
  mobile_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  village: string | null;
  district: string | null;
  province: string | null;
  postal_address: string | null;
  lot: string | null;
  section: string | null;
  suburb: string | null;
  street_name: string | null;
  department_company: string | null;
  position: string | null;
  date_employed: string | null;
  work_phone_number: string | null;
  file_number: string | null;
  paymaster: string | null;
  company_branch: string | null;
  fax: string | null;
  marital_status: string | null;
  spouse_last_name: string | null;
  spouse_first_name: string | null;
  spouse_employer_name: string | null;
  spouse_contact_details: string | null;
  bank: string | null;
  bank_branch: string | null;
  bsb_code: string | null;
  account_name: string | null;
  account_number: string | null;
  account_type: string | null;
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
            surname: values[1] || "",
            given_name: values[2] || "",
            email: values[3] || "",
            mobile_number: values[4] || "",
            date_of_birth: values[5] || "",
            gender: values[6] || "",
            nationality: values[7] || "",
            village: values[8] || "",
            district: values[9] || "",
            province: values[10] || "",
            postal_address: values[11] || "",
            lot: values[12] || "",
            section: values[13] || "",
            suburb: values[14] || "",
            street_name: values[15] || "",
            department_company: values[16] || "",
            position: values[17] || "",
            date_employed: values[18] || "",
            work_phone_number: values[19] || "",
            file_number: values[20] || "",
            paymaster: values[21] || "",
            company_branch: values[22] || "",
            fax: values[23] || "",
            marital_status: values[24] || "",
            spouse_last_name: values[25] || "",
            spouse_first_name: values[26] || "",
            spouse_employer_name: values[27] || "",
            spouse_contact_details: values[28] || "",
            bank: values[29] || "",
            bank_branch: values[30] || "",
            bsb_code: values[31] || "",
            account_name: values[32] || "",
            account_number: values[33] || "",
            account_type: values[34] || "",
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
      const borrowersToInsert: BorrowerInsert[] = csvData.map(borrower => {
        return {
          surname: borrower.surname,
          given_name: borrower.given_name,
          email: borrower.email,
          mobile_number: borrower.mobile_number || null,
          date_of_birth: borrower.date_of_birth || null,
          gender: borrower.gender || null,
          nationality: borrower.nationality || null,
          village: borrower.village || null,
          district: borrower.district || null,
          province: borrower.province || null,
          postal_address: borrower.postal_address || null,
          lot: borrower.lot || null,
          section: borrower.section || null,
          suburb: borrower.suburb || null,
          street_name: borrower.street_name || null,
          department_company: borrower.department_company || null,
          position: borrower.position || null,
          date_employed: borrower.date_employed || null,
          work_phone_number: borrower.work_phone_number || null,
          file_number: borrower.file_number || null,
          paymaster: borrower.paymaster || null,
          company_branch: borrower.company_branch || null,
          fax: borrower.fax || null,
          marital_status: borrower.marital_status || null,
          spouse_last_name: borrower.spouse_last_name || null,
          spouse_first_name: borrower.spouse_first_name || null,
          spouse_employer_name: borrower.spouse_employer_name || null,
          spouse_contact_details: borrower.spouse_contact_details || null,
          bank: borrower.bank || null,
          bank_branch: borrower.bank_branch || null,
          bsb_code: borrower.bsb_code || null,
          account_name: borrower.account_name || null,
          account_number: borrower.account_number || null,
          account_type: borrower.account_type || null,
        };
      });

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
      
      setCSVData([]);
    } catch (error) {
      console.error("Error in bulk upload:", error);
      toast.error("Failed to upload borrowers");
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
        <h1 className="text-2xl font-bold">Bulk Borrower Upload</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <p className="text-muted-foreground mb-2">
              Upload a CSV file with the following columns in this order: borrower_id (auto-generated), Surname, Given Name, Email, Mobile Number, Date of Birth, Gender, Nationality, Village, District, Province, Postal Address, Lot, Section, Suburb, Street Name, Department/Company, Position, Date Employed, Work Phone Number, File Number, Paymaster, Company Branch, Fax, Marital Status, Spouse Last Name, Spouse First Name, Spouse Employer Name, Spouse Contact Details, Bank, Bank Branch, BSB Code, Account Name, Account Number, Account Type
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
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={csvData.length === 0 || isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
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
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Village</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Province</TableHead>
                      <TableHead>Postal Address</TableHead>
                      <TableHead>Lot</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Suburb</TableHead>
                      <TableHead>Street Name</TableHead>
                      <TableHead>Department/Company</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Date Employed</TableHead>
                      <TableHead>Work Phone Number</TableHead>
                      <TableHead>File Number</TableHead>
                      <TableHead>Paymaster</TableHead>
                      <TableHead>Company Branch</TableHead>
                      <TableHead>Fax</TableHead>
                      <TableHead>Marital Status</TableHead>
                      <TableHead>Spouse Last Name</TableHead>
                      <TableHead>Spouse First Name</TableHead>
                      <TableHead>Spouse Employer Name</TableHead>
                      <TableHead>Spouse Contact Details</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Bank Branch</TableHead>
                      <TableHead>BSB Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Account Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((borrower, index) => (
                      <TableRow key={index}>
                        <TableCell>{borrower.surname}</TableCell>
                        <TableCell>{borrower.given_name}</TableCell>
                        <TableCell>{borrower.email}</TableCell>
                        <TableCell>{borrower.mobile_number}</TableCell>
                        <TableCell>{borrower.date_of_birth}</TableCell>
                        <TableCell>{borrower.gender}</TableCell>
                        <TableCell>{borrower.nationality}</TableCell>
                        <TableCell>{borrower.village}</TableCell>
                        <TableCell>{borrower.district}</TableCell>
                        <TableCell>{borrower.province}</TableCell>
                        <TableCell>{borrower.postal_address}</TableCell>
                        <TableCell>{borrower.lot}</TableCell>
                        <TableCell>{borrower.section}</TableCell>
                        <TableCell>{borrower.suburb}</TableCell>
                        <TableCell>{borrower.street_name}</TableCell>
                        <TableCell>{borrower.department_company}</TableCell>
                        <TableCell>{borrower.position}</TableCell>
                        <TableCell>{borrower.date_employed}</TableCell>
                        <TableCell>{borrower.work_phone_number}</TableCell>
                        <TableCell>{borrower.file_number}</TableCell>
                        <TableCell>{borrower.paymaster}</TableCell>
                        <TableCell>{borrower.company_branch}</TableCell>
                        <TableCell>{borrower.fax}</TableCell>
                        <TableCell>{borrower.marital_status}</TableCell>
                        <TableCell>{borrower.spouse_last_name}</TableCell>
                        <TableCell>{borrower.spouse_first_name}</TableCell>
                        <TableCell>{borrower.spouse_employer_name}</TableCell>
                        <TableCell>{borrower.spouse_contact_details}</TableCell>
                        <TableCell>{borrower.bank}</TableCell>
                        <TableCell>{borrower.bank_branch}</TableCell>
                        <TableCell>{borrower.bsb_code}</TableCell>
                        <TableCell>{borrower.account_name}</TableCell>
                        <TableCell>{borrower.account_number}</TableCell>
                        <TableCell>{borrower.account_type}</TableCell>
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
