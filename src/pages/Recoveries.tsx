import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { recoveriesApi } from "@/lib/api/recoveries";

interface LoanInArrears {
  id: string;
  borrowerName: string;
  loanAmount: number;
  daysOverdue: number;
  amountOverdue: number;
  lastPaymentDate: string;
}

const Recoveries = () => {
  const [selectedView, setSelectedView] = useState<string>("loans-in-arrears");
  const [isLoading, setIsLoading] = useState(false);
  const [loansInArrears, setLoansInArrears] = useState<LoanInArrears[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoansInArrears();
  }, []);

  const fetchLoansInArrears = async () => {
    try {
      setIsLoading(true);
      setLoansInArrears([
        {
          id: "L001",
          borrowerName: "John Doe",
          loanAmount: 10000,
          daysOverdue: 30,
          amountOverdue: 1200,
          lastPaymentDate: "2024-01-15",
        },
        {
          id: "L002",
          borrowerName: "Jane Smith",
          loanAmount: 15000,
          daysOverdue: 45,
          amountOverdue: 2000,
          lastPaymentDate: "2024-01-01",
        },
        {
          id: "L003",
          borrowerName: "Bob Wilson",
          loanAmount: 8000,
          daysOverdue: 60,
          amountOverdue: 3000,
          lastPaymentDate: "2023-12-15",
        }
      ]);
    } catch (error) {
      console.error("Error fetching loans in arrears:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChange = (view: string) => {
    setSelectedView(view);
    navigate(`/admin/recoveries/${view}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Recoveries Management</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              View Options <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={() => handleViewChange("loans-in-arrears")}>
              Loans in Arrears
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewChange("missed-payments")}>
              Missed Payments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewChange("partial-payments")}>
              Partial Payments
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Loans in Arrears</h2>
        <p className="mb-4">
          Select a specific recovery view from the dropdown menu or use these quick links:
        </p>
        <div className="flex flex-wrap gap-3 mb-6">
          <Button variant="outline" asChild>
            <Link to="/admin/recoveries/loans-in-arrears">Loans in Arrears</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/recoveries/missed-payments">Missed Payments</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/recoveries/partial-payments">Partial Payments</Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan ID</TableHead>
              <TableHead>Borrower Name</TableHead>
              <TableHead>Loan Amount</TableHead>
              <TableHead>Days Overdue</TableHead>
              <TableHead>Amount Overdue</TableHead>
              <TableHead>Last Payment Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : loansInArrears.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>{loan.id}</TableCell>
                <TableCell>{loan.borrowerName}</TableCell>
                <TableCell>K{loan.loanAmount.toFixed(2)}</TableCell>
                <TableCell>{loan.daysOverdue}</TableCell>
                <TableCell>K{loan.amountOverdue.toFixed(2)}</TableCell>
                <TableCell>{loan.lastPaymentDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Recoveries;
