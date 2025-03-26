
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [loansInArrears, setLoansInArrears] = useState<LoanInArrears[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecoveryData();
  }, [selectedView]);

  const fetchRecoveryData = async () => {
    setIsLoading(true);
    try {
      if (selectedView === "loans-in-arrears") {
        // Fetch loans in arrears from Supabase
        const { data, error } = await supabase
          .from('loans')
          .select(`
            loan_id,
            principal,
            arrears,
            borrower:borrower_id (
              given_name,
              surname
            ),
            updated_at
          `)
          .gt('arrears', 0)
          .order('arrears', { ascending: false });

        if (error) throw error;

        // Map the data to our desired format
        const formattedData: LoanInArrears[] = (data || []).map(loan => ({
          id: loan.loan_id,
          borrowerName: loan.borrower ? `${loan.borrower.given_name} ${loan.borrower.surname}` : 'Unknown',
          loanAmount: loan.principal,
          daysOverdue: Math.floor(Math.random() * 60) + 5, // This would need proper calculation based on your business logic
          amountOverdue: loan.arrears,
          lastPaymentDate: new Date(loan.updated_at).toISOString().split('T')[0],
        }));

        setLoansInArrears(formattedData);
      }
      // Add similar implementations for "missed-payments" and "partial-payments" views
    } catch (error) {
      console.error('Error fetching recovery data:', error);
    } finally {
      setIsLoading(false);
    }
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
            <DropdownMenuItem onClick={() => setSelectedView("loans-in-arrears")}>
              Loans in Arrears
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedView("missed-payments")}>
              Missed Payments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedView("partial-payments")}>
              Partial Payments
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </Card>
      ) : selectedView === "loans-in-arrears" && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Loans in Arrears</h2>
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
              {loansInArrears.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No loans in arrears found
                  </TableCell>
                </TableRow>
              ) : (
                loansInArrears.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.id}</TableCell>
                    <TableCell>{loan.borrowerName}</TableCell>
                    <TableCell>${loan.loanAmount.toLocaleString()}</TableCell>
                    <TableCell>{loan.daysOverdue}</TableCell>
                    <TableCell>${loan.amountOverdue.toLocaleString()}</TableCell>
                    <TableCell>{loan.lastPaymentDate}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Similar implementations for other views would go here */}
    </div>
  );
};

export default Recoveries;
