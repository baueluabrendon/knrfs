
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
  branchName?: string;
  branchCode?: string;
  // Additional fields from borrowers table - allowing null values
  givenName?: string | null;
  surname?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  mobileNumber?: string | null;
  village?: string | null;
  district?: string | null;
  province?: string | null;
  nationality?: string | null;
  departmentCompany?: string | null;
  position?: string | null;
  postalAddress?: string | null;
  workPhoneNumber?: string | null;
  fax?: string | null;
  dateEmployed?: string | null;
  paymaster?: string | null;
  lot?: string | null;
  section?: string | null;
  suburb?: string | null;
  streetName?: string | null;
  maritalStatus?: string | null;
  spouseLastName?: string | null;
  spouseFirstName?: string | null;
  spouseEmployerName?: string | null;
  spouseContactDetails?: string | null;
  employerBranch?: string | null;
  bank?: string | null;
  bankBranch?: string | null;
  bsbCode?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  accountType?: string | null;
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
  const [loanHistory, setLoanHistory] = useState<Loan[]>([]);

  const fetchBorrowers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('borrowers')
        .select(`
          *,
          branches!branch_id (
            id,
            branch_name,
            branch_code
          )
        `);
      
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
        branchName: b.branches?.branch_name || 'No Branch',
        branchCode: b.branches?.branch_code,
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
        employerBranch: b.branches?.branch_name,
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
      
      const insertData: BorrowerInsertData = {
        given_name: formData.given_name,
        surname: formData.surname,
        email: formData.email,
        branch_id: formData.branch_id || null,
        mobile_number: formData.mobile_number || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        nationality: formData.nationality || null,
        village: formData.village || null,
        district: formData.district || null,
        province: formData.province || null,
        postal_address: formData.postal_address || null,
        lot: formData.lot || null,
        section: formData.section || null,
        suburb: formData.suburb || null,
        street_name: formData.street_name || null,
        department_company: formData.department_company || null,
        client_type: formData.client_type || null,
        position: formData.position || null,
        date_employed: formData.date_employed || null,
        work_phone_number: formData.work_phone_number || null,
        file_number: formData.file_number || null,
        paymaster: formData.paymaster || null,
        fax: formData.fax || null,
        marital_status: formData.marital_status || null,
        spouse_last_name: formData.spouse_last_name || null,
        spouse_first_name: formData.spouse_first_name || null,
        spouse_employer_name: formData.spouse_employer_name || null,
        spouse_contact_details: formData.spouse_contact_details || null,
        bank: formData.bank || null,
        bank_branch: formData.bank_branch || null,
        bsb_code: formData.bsb_code || null,
        account_name: formData.account_name || null,
        account_number: formData.account_number || null,
        account_type: formData.account_type || null
      };
      
      const { data, error } = await supabase
        .from('borrowers')
        .insert([insertData])
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

  const fetchLoanHistory = async (borrowerId: string) => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('loan_id, principal, disbursement_date, settled_date, loan_status')
        .eq('borrower_id', borrowerId)
        .order('disbursement_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching loan history:', error);
        toast.error('Failed to fetch loan history');
        return [];
      }

      return data.map(loan => ({
        id: loan.loan_id,
        amount: loan.principal,
        startDate: loan.disbursement_date,
        endDate: loan.settled_date,
        status: loan.loan_status === 'settled' ? 'repaid' as const : 'active' as const
      }));
    } catch (error) {
      console.error('Error fetching loan history:', error);
      return [];
    }
  };

  const handleBorrowerClick = async (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setShowBorrowerDetails(true);
    const history = await fetchLoanHistory(borrower.id);
    setLoanHistory(history);
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

      <Card className="p-6">
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
