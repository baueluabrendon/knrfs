import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Plus, Printer, Mail, X } from "lucide-react";

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
  const [newBorrower, setNewBorrower] = useState<Partial<Borrower>>({});
  const [showBorrowerDetails, setShowBorrowerDetails] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBorrower((prev) => ({
      ...prev,
      [name]: name === 'monthlyIncome' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `B${(borrowers.length + 1).toString().padStart(3, '0')}`;
    setBorrowers((prev) => [...prev, { ...newBorrower, id, activeLoanId: null } as Borrower]);
    setNewBorrower({});
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    // Implement email functionality
    console.log('Email functionality to be implemented');
  };

  const handleBorrowerClick = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setShowBorrowerDetails(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Borrowers Management</h1>
          <Dialog>
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newBorrower.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newBorrower.email || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={newBorrower.phone || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={newBorrower.address || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      value={newBorrower.occupation || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="monthlyIncome">Monthly Income</Label>
                    <Input
                      id="monthlyIncome"
                      name="monthlyIncome"
                      type="number"
                      value={newBorrower.monthlyIncome || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Borrower</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Monthly Income</TableHead>
                <TableHead>Active Loan ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrowers.map((borrower) => (
                <TableRow key={borrower.id}>
                  <TableCell>
                    <button 
                      className="text-blue-600 hover:underline"
                      onClick={() => handleBorrowerClick(borrower)}
                    >
                      {borrower.id}
                    </button>
                  </TableCell>
                  <TableCell>
                    <button 
                      className="text-blue-600 hover:underline"
                      onClick={() => handleBorrowerClick(borrower)}
                    >
                      {borrower.name}
                    </button>
                  </TableCell>
                  <TableCell>{borrower.email}</TableCell>
                  <TableCell>{borrower.phone}</TableCell>
                  <TableCell>{borrower.address}</TableCell>
                  <TableCell>{borrower.occupation}</TableCell>
                  <TableCell>${borrower.monthlyIncome.toLocaleString()}</TableCell>
                  <TableCell>{borrower.activeLoanId || 'No active loan'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Borrower Details Dialog */}
        <Dialog open={showBorrowerDetails} onOpenChange={setShowBorrowerDetails}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Borrower Details</DialogTitle>
              <div className="flex gap-2 absolute right-4 top-4">
                <Button variant="outline" size="icon" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleEmail}>
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setShowBorrowerDetails(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            
            {selectedBorrower && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ID</Label>
                    <div className="mt-1">{selectedBorrower.id}</div>
                  </div>
                  <div>
                    <Label>Name</Label>
                    <div className="mt-1">{selectedBorrower.name}</div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="mt-1">{selectedBorrower.email}</div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <div className="mt-1">{selectedBorrower.phone}</div>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <div className="mt-1">{selectedBorrower.address}</div>
                  </div>
                  <div>
                    <Label>Occupation</Label>
                    <div className="mt-1">{selectedBorrower.occupation}</div>
                  </div>
                  <div>
                    <Label>Monthly Income</Label>
                    <div className="mt-1">${selectedBorrower.monthlyIncome.toLocaleString()}</div>
                  </div>
                  <div>
                    <Label>Active Loan ID</Label>
                    <div className="mt-1">{selectedBorrower.activeLoanId || 'No active loan'}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Loan History</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loanHistory.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>{loan.id}</TableCell>
                          <TableCell>${loan.amount.toLocaleString()}</TableCell>
                          <TableCell>{new Date(loan.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {loan.endDate ? new Date(loan.endDate).toLocaleDateString() : 'Active'}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                              loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Borrowers;