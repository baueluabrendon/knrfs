import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const cashflowData = {
  operating: [
    { name: "Cash Receipts from Customers", amount: 800000 },
    { name: "Cash Paid to Suppliers", amount: -200000 },
    { name: "Cash Paid to Employees", amount: -250000 },
    { name: "Interest Received", amount: 25000 },
    { name: "Interest Paid", amount: -50000 },
    { name: "Income Taxes Paid", amount: -75000 },
  ],
  investing: [
    { name: "Purchase of Property and Equipment", amount: -100000 },
    { name: "Sale of Equipment", amount: 20000 },
    { name: "Investment in Financial Assets", amount: -50000 },
  ],
  financing: [
    { name: "Proceeds from Long-term Borrowings", amount: 300000 },
    { name: "Repayment of Borrowings", amount: -150000 },
    { name: "Dividends Paid", amount: -100000 },
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always',
  }).format(amount);
};

const Cashflow = () => {
  const calculateTotal = (items: { amount: number }[]) => {
    return items.reduce((total, item) => total + item.amount, 0);
  };

  const operatingCashflow = calculateTotal(cashflowData.operating);
  const investingCashflow = calculateTotal(cashflowData.investing);
  const financingCashflow = calculateTotal(cashflowData.financing);
  const netCashflow = operatingCashflow + investingCashflow + financingCashflow;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Statement of Cash Flows</h1>
        <p className="text-sm text-muted-foreground">For the period ending {new Date().toLocaleDateString()}</p>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Operating Activities */}
            <TableRow className="font-semibold">
              <TableCell colSpan={2}>Cash Flows from Operating Activities</TableCell>
            </TableRow>
            {cashflowData.operating.map((item) => (
              <TableRow key={item.name}>
                <TableCell className="pl-8">{item.name}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold">
              <TableCell>Net Cash from Operating Activities</TableCell>
              <TableCell className="text-right">{formatCurrency(operatingCashflow)}</TableCell>
            </TableRow>

            {/* Investing Activities */}
            <TableRow className="font-semibold">
              <TableCell colSpan={2}>Cash Flows from Investing Activities</TableCell>
            </TableRow>
            {cashflowData.investing.map((item) => (
              <TableRow key={item.name}>
                <TableCell className="pl-8">{item.name}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold">
              <TableCell>Net Cash from Investing Activities</TableCell>
              <TableCell className="text-right">{formatCurrency(investingCashflow)}</TableCell>
            </TableRow>

            {/* Financing Activities */}
            <TableRow className="font-semibold">
              <TableCell colSpan={2}>Cash Flows from Financing Activities</TableCell>
            </TableRow>
            {cashflowData.financing.map((item) => (
              <TableRow key={item.name}>
                <TableCell className="pl-8">{item.name}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold">
              <TableCell>Net Cash from Financing Activities</TableCell>
              <TableCell className="text-right">{formatCurrency(financingCashflow)}</TableCell>
            </TableRow>

            {/* Net Change in Cash */}
            <TableRow className="font-semibold text-lg">
              <TableCell>Net Increase/(Decrease) in Cash</TableCell>
              <TableCell className="text-right">{formatCurrency(netCashflow)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Cashflow;
