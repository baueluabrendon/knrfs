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
import { Plus } from "lucide-react";

interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  monthlyIncome: number;
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
    },
    {
      id: "B002",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1987654321",
      address: "456 Oak Ave, Town",
      occupation: "Teacher",
      monthlyIncome: 4000,
    },
  ]);

  const [newBorrower, setNewBorrower] = useState<Partial<Borrower>>({});

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
    setBorrowers((prev) => [...prev, { ...newBorrower, id } as Borrower]);
    setNewBorrower({});
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrowers.map((borrower) => (
                <TableRow key={borrower.id}>
                  <TableCell>{borrower.id}</TableCell>
                  <TableCell>{borrower.name}</TableCell>
                  <TableCell>{borrower.email}</TableCell>
                  <TableCell>{borrower.phone}</TableCell>
                  <TableCell>{borrower.address}</TableCell>
                  <TableCell>{borrower.occupation}</TableCell>
                  <TableCell>${borrower.monthlyIncome.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Borrowers;