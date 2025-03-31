
import { useState, useEffect } from "react";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BorrowerForm, { BorrowerFormData, BorrowerInsertData } from "@/components/borrowers/BorrowerForm";
import BorrowerDetails from "@/components/borrowers/BorrowerDetails";
import BorrowersTable from "@/components/borrowers/BorrowersTable";
import BorrowerDialog from "@/components/borrowers/BorrowerDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  organization: string;
  monthlyIncome: number;
  activeLoanId: string | null;
  fileNumber: string | null;
  // Additional fields from borrowers table
  givenName?: string;
  surname?: string;
  dateOfBirth?: string;
  gender?: string;
  mobileNumber?: string;
  village?: string;
  district?: string;
  province?: string;
  nationality?: string;
  departmentCompany?: string;
  position?: string;
  postalAddress?: string;
  workPhoneNumber?: string;
  fax?: string;
  dateEmployed?: string;
  paymaster?: string;
  lot?: string;
  section?: string;
  suburb?: string;
  streetName?: string;
  maritalStatus?: string;
  spouseLastName?: string;
  spouseFirstName?: string;
  spouseEmployerName?: string;
  spouseContactDetails?: string;
  companyBranch?: string;
  bank?: string;
  bankBranch?: string;
  bsbCode?: string;
  accountName?: string;
  accountNumber?: string;
  accountType?: string;
}

interface Loan {
  id: string;
  amount: number;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'repaid';
}

const Borrowers = () => {
  const navigate = useNavigate();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState<Borrower[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [showBorrowerDetails, setShowBorrowerDetails] = useState(false);
  const [showAddBorrower, setShowAddBorrower] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loanHistory: Loan[] = [
    {
      id: "L001",
      amount: 10000,
      startDate: "2024-01-01",
      endDate: null,
      status: 'active'
    },
    {
      id: "L002",
      amount: 5000,
      startDate: "2023-06-01",
      endDate: "2023-12-31",
      status: 'repaid'
    }
  ];

  const fetchBorrowers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('borrowers')
        .select('*');
      
      if (error) {
        toast.error('Failed to fetch borrowers: ' + error.message);
        return;
      }

      // Fetch active loans for each borrower
      const borrowerIds = data.map(b => b.borrower_id);
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('loan_id, borrower_id')
        .in('borrower_id', borrowerIds)
        .eq('loan_status', 'active');
      
      if (loansError) {
        console.error('Error fetching active loans:', loansError);
      }

      // Create a map of borrower_id to active loan_id
      const activeLoanMap = new Map();
      if (loansData) {
        loansData.forEach(loan => {
          activeLoanMap.set(loan.borrower_id, loan.loan_id);
        });
      }

      const mappedBorrowers: Borrower[] = data.map(b => ({
        id: b.borrower_id,
        name: `${b.given_name} ${b.surname}`,
        email: b.email,
        phone: b.mobile_number || '',
        address: [b.lot, b.section, b.street_name, b.suburb, b.district, b.province]
          .filter(Boolean)
          .join(', ') || b.postal_address || '',
        occupation: b.position || '',
        organization: b.department_company || '',
        monthlyIncome: 0,
        activeLoanId: activeLoanMap.get(b.borrower_id) || null,
        fileNumber: b.file_number,
        // Map additional fields
        givenName: b.given_name,
        surname: b.surname,
        dateOfBirth: b.date_of_birth,
        gender: b.gender,
        mobileNumber: b.mobile_number,
        village: b.village,
        district: b.district,
        province: b.province,
        nationality: b.nationality,
        departmentCompany: b.department_company,
        position: b.position,
        postalAddress: b.postal_address,
        workPhoneNumber: b.work_phone_number,
        fax: b.fax,
        dateEmployed: b.date_employed,
        paymaster: b.paymaster,
        lot: b.lot,
        section: b.section,
        suburb: b.suburb,
        streetName: b.street_name,
        maritalStatus: b.marital_status,
        spouseLastName: b.spouse_last_name,
        spouseFirstName: b.spouse_first_name,
        spouseEmployerName: b.spouse_employer_name,
        spouseContactDetails: b.spouse_contact_details,
        companyBranch: b.company_branch,
        bank: b.bank,
        bankBranch: b.bank_branch,
        bsbCode: b.bsb_code,
        accountName: b.account_name,
        accountNumber: b.account_number,
        accountType: b.account_type
      }));

      setBorrowers(mappedBorrowers);
      setFilteredBorrowers(mappedBorrowers);
    } catch (error) {
      console.error('Error fetching borrowers:', error);
      toast.error('Failed to load borrowers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBorrowers(borrowers);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = borrowers.filter(
        borrower =>
          borrower.name.toLowerCase().includes(lowercaseQuery) ||
          borrower.email.toLowerCase().includes(lowercaseQuery) ||
          borrower.id.toLowerCase().includes(lowercaseQuery) ||
          (borrower.phone && borrower.phone.toLowerCase().includes(lowercaseQuery)) ||
          (borrower.organization && borrower.organization.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredBorrowers(filtered);
    }
  }, [searchQuery, borrowers]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddBorrower = async (formData: BorrowerFormData) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('borrowers')
        .insert([formData as unknown as BorrowerInsertData])
        .select();
      
      if (error) {
        toast.error('Failed to add borrower: ' + error.message);
        return;
      }
      
      setShowAddBorrower(false);
      toast.success("Borrower added successfully");
      
      fetchBorrowers();
    } catch (error) {
      console.error('Error adding borrower:', error);
      toast.error('Failed to add borrower');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrowerClick = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setShowBorrowerDetails(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    console.log('Email functionality to be implemented');
    toast.info("Email feature coming soon");
  };

  const handleBulkUpload = () => {
    navigate("/admin/borrowers/bulk");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Borrowers Management</h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleBulkUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Borrowers
          </Button>
          <BorrowerDialog
            open={showAddBorrower}
            onOpenChange={setShowAddBorrower}
            onSubmit={handleAddBorrower}
          />
          <Button onClick={() => setShowAddBorrower(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Borrower
          </Button>
        </div>
      </div>

      <Card className="p-6 max-h-[calc(100vh-170px)] overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10">Loading borrowers...</div>
        ) : (
          <BorrowersTable 
            borrowers={filteredBorrowers}
            onBorrowerClick={handleBorrowerClick}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
        )}
      </Card>

      <Dialog open={showBorrowerDetails} onOpenChange={setShowBorrowerDetails}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Borrower Details</DialogTitle>
          </DialogHeader>
          {selectedBorrower && (
            <BorrowerDetails
              borrower={selectedBorrower}
              loanHistory={loanHistory}
              onClose={() => setShowBorrowerDetails(false)}
              onPrint={handlePrint}
              onEmail={handleEmail}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Borrowers;
