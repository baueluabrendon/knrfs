
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import BorrowerForm, { BorrowerFormData } from "@/components/borrowers/BorrowerForm";
import BorrowerDetails from "@/components/borrowers/BorrowerDetails";
import BorrowersTable from "@/components/borrowers/BorrowersTable";
import { toast } from "sonner";

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

  // Sample loan history data
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

  const handleAddBorrower = (formData: BorrowerFormData) => {
    const newBorrower: Borrower = {
      ...formData,
      id: `B${(borrowers.length + 1).toString().padStart(3, '0')}`,
      activeLoanId: null,
    };
    setBorrowers((prev) => [...prev, newBorrower]);
    setShowAddBorrower(false);
    toast.success("Borrower added successfully");
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
        <Dialog open={showAddBorrower} onOpenChange={setShowAddBorrower}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Borrower
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Borrower</DialogTitle>
            </DialogHeader>
            <BorrowerForm 
              onSubmit={handleAddBorrower}
              onCancel={() => setShowAddBorrower(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <BorrowersTable 
          borrowers={borrowers}
          onBorrowerClick={handleBorrowerClick}
        />
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
