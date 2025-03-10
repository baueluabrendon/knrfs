import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BorrowerForm, { BorrowerFormData } from "@/components/borrowers/BorrowerForm";
import BorrowerDetails from "@/components/borrowers/BorrowerDetails";
import BorrowersTable from "@/components/borrowers/BorrowersTable";
import BorrowerDialog from "@/components/borrowers/BorrowerDialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  monthlyIncome: number;
  activeLoanId: string | null;
}

interface Loan {
  id: string;
  amount: number;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'repaid';
}

const Borrowers = () => {
  const [borrowers, setBorrowers] = useState<Borrower[]>([
    {
      id: "B001",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      address: "123 Main St, City",
      occupation: "Software Engineer",
      monthlyIncome: 5000,
      activeLoanId: "L001"
    },
    {
      id: "B002",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1987654321",
      address: "456 Oak Ave, Town",
      occupation: "Teacher",
      monthlyIncome: 4000,
      activeLoanId: null
    },
  ]);

  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [showBorrowerDetails, setShowBorrowerDetails] = useState(false);
  const [showAddBorrower, setShowAddBorrower] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

      const mappedBorrowers: Borrower[] = data.map(b => ({
        id: b.borrower_id,
        name: `${b.given_name} ${b.surname}`,
        email: b.email,
        phone: b.mobile_number || '',
        address: [b.lot, b.section, b.street_name, b.suburb, b.district, b.province]
          .filter(Boolean)
          .join(', ') || b.postal_address || '',
        occupation: b.position || '',
        monthlyIncome: 0,
        activeLoanId: null
      }));

      setBorrowers(mappedBorrowers);
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

  const handleAddBorrower = async (formData: BorrowerFormData) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('borrowers')
        .insert([formData])
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Borrowers Management</h1>
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

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center py-10">Loading borrowers...</div>
        ) : (
          <BorrowersTable 
            borrowers={borrowers}
            onBorrowerClick={handleBorrowerClick}
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
