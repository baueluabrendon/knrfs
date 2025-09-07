
import { useState, useEffect } from "react";
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

interface CSVBorrower {
  surname: string;
  given_name: string;
  email: string;
  branch_name: string;
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
  branch_id: string | null;
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
  const [branches, setBranches] = useState<{[key: string]: string}>({});

  // Fetch branches on component mount for mapping
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from('branches' as any)
          .select('id, branch_name, branch_code')
          .eq('is_active', true);

        if (error) throw error;
        
        // Create a map of branch names to IDs for CSV lookup
        const branchMap: {[key: string]: string} = {};
        data?.forEach((branch: any) => {
          branchMap[branch.branch_name.toLowerCase()] = branch.id;
          branchMap[branch.branch_code.toLowerCase()] = branch.id;
        });
        setBranches(branchMap);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

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
            surname: row.surname || "",
            given_name: row.given_name || "",
            date_of_birth: row.date_of_birth || "",
            gender: row.gender || "",
            mobile_number: row.mobile_number || "",
            email: row.email || "",
            branch_name: row.branch_name || "",
            village: row.village || "",
            district: row.district || "",
            province: row.province || "",
            nationality: row.nationality || "",
            department_company: row.department_company || "",
            file_number: row.file_number || "",
            position: row.position || "",
            postal_address: row.postal_address || "",
            work_phone_number: row.work_phone_number || "",
            fax: row.fax || "",
            date_employed: row.date_employed || "",
            paymaster: row.paymaster || "",
            lot: row.lot || "",
            section: row.section || "",
            suburb: row.suburb || "",
            street_name: row.street_name || "",
            marital_status: row.marital_status || "",
            spouse_last_name: row.spouse_last_name || "",
            spouse_first_name: row.spouse_first_name || "",
            spouse_employer_name: row.spouse_employer_name || "",
            spouse_contact_details: row.spouse_contact_details || "",
            company_branch: row.company_branch || "",
            bank: row.bank || "",
            bank_branch: row.bank_branch || "",
            bsb_code: row.bsb_code || "",
            account_name: row.account_name || "",
            account_number: row.account_number || "",
            account_type: row.account_type || "",
          }));

          setCSVData(parsedData);
          toast.success(`Successfully parsed ${parsedData.length} borrowers`);
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
      const borrowersToInsert: BorrowerInsert[] = csvData.map(borrower => {
        // Look up branch ID from branch name
        const branchId = borrower.branch_name ? 
          branches[borrower.branch_name.toLowerCase()] || null : null;
        
        return {
          surname: borrower.surname,
          given_name: borrower.given_name,
          email: borrower.email,
          branch_id: branchId,
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
          .from('borrowers' as any)
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

  const downloadTemplateCSV = () => {
    const headers = "surname,given_name,date_of_birth,gender,mobile_number,email,branch_name,village,district,province,nationality,department_company,file_number,position,postal_address,work_phone_number,fax,date_employed,paymaster,lot,section,suburb,street_name,marital_status,spouse_last_name,spouse_first_name,spouse_employer_name,spouse_contact_details,company_branch,bank,bank_branch,bsb_code,account_name,account_number,account_type";
    const csvContent = `${headers}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'borrowers_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV template downloaded");
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
              Upload a CSV file with the following columns: Surname, Given Name, Date of Birth, Gender, Mobile Number, Email, Branch Name, Village, District, Province, Nationality, Department/Company, File Number, Position, Postal Address, Work Phone Number, Fax, Date Employed, Paymaster, Lot, Section, Suburb, Street Name, Marital Status, Spouse Last Name, Spouse First Name, Spouse Employer Name, Spouse Contact Details, Company Branch, Bank, Bank Branch, BSB Code, Account Name, Account Number, Account Type
            </p>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <label htmlFor="csv-file-input" className="sr-only">
                  Upload CSV file with borrower data
                </label>
                <Button
                  variant="outline"
                  className="relative"
                  disabled={isLoading}
                  asChild
                >
                  <label htmlFor="csv-file-input" className="cursor-pointer">
                    <input
                      id="csv-file-input"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Upload CSV file with borrower data"
                    />
                    <Upload className="mr-2 h-4 w-4" />
                    Select CSV File
                  </label>
                </Button>
              </div>
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
              <h2 className="text-lg font-semibold mb-4">Preview ({csvData.length} borrowers)</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Surname</TableHead>
                      <TableHead>Given Name</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Mobile Number</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Village</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Province</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Department/Company</TableHead>
                      <TableHead>File Number</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Postal Address</TableHead>
                      <TableHead>Work Phone Number</TableHead>
                      <TableHead>Fax</TableHead>
                      <TableHead>Date Employed</TableHead>
                      <TableHead>Paymaster</TableHead>
                      <TableHead>Lot</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Suburb</TableHead>
                      <TableHead>Street Name</TableHead>
                      <TableHead>Marital Status</TableHead>
                      <TableHead>Spouse Last Name</TableHead>
                      <TableHead>Spouse First Name</TableHead>
                      <TableHead>Spouse Employer Name</TableHead>
                      <TableHead>Spouse Contact Details</TableHead>
                      <TableHead>Company Branch</TableHead>
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
                        <TableCell>{borrower.date_of_birth}</TableCell>
                        <TableCell>{borrower.gender}</TableCell>
                        <TableCell>{borrower.mobile_number}</TableCell>
                        <TableCell>{borrower.email}</TableCell>
                        <TableCell>{borrower.branch_name}</TableCell>
                        <TableCell>{borrower.village}</TableCell>
                        <TableCell>{borrower.district}</TableCell>
                        <TableCell>{borrower.province}</TableCell>
                        <TableCell>{borrower.nationality}</TableCell>
                        <TableCell>{borrower.department_company}</TableCell>
                        <TableCell>{borrower.file_number}</TableCell>
                        <TableCell>{borrower.position}</TableCell>
                        <TableCell>{borrower.postal_address}</TableCell>
                        <TableCell>{borrower.work_phone_number}</TableCell>
                        <TableCell>{borrower.fax}</TableCell>
                        <TableCell>{borrower.date_employed}</TableCell>
                        <TableCell>{borrower.paymaster}</TableCell>
                        <TableCell>{borrower.lot}</TableCell>
                        <TableCell>{borrower.section}</TableCell>
                        <TableCell>{borrower.suburb}</TableCell>
                        <TableCell>{borrower.street_name}</TableCell>
                        <TableCell>{borrower.marital_status}</TableCell>
                        <TableCell>{borrower.spouse_last_name}</TableCell>
                        <TableCell>{borrower.spouse_first_name}</TableCell>
                        <TableCell>{borrower.spouse_employer_name}</TableCell>
                        <TableCell>{borrower.spouse_contact_details}</TableCell>
                        <TableCell>{borrower.company_branch}</TableCell>
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
                  {isLoading ? "Processing..." : "Submit Borrowers"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BulkBorrowers;
