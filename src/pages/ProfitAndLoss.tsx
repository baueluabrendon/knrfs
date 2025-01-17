import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const profitLossData = {
  income: [
    { name: "Operating Income", items: [
      { name: "Interest Income", amount: 750000 },
      { name: "Fee Income", amount: 50000 },
      { name: "Other Operating Income", amount: 25000 },
    ]},
  ],
  expenses: [
    { name: "Operating Expenses", items: [
      { name: "Employee Salaries", amount: 200000 },
      { name: "Rent Expense", amount: 50000 },
      { name: "Utilities", amount: 25000 },
      { name: "Bad Debt Expense", amount: 100000 },
      { name: "Other Operating Expenses", amount: 75000 },
    ]},
    { name: "Non-Operating Expenses", items: [
      { name: "Interest Expense", amount: 50000 },
      { name: "Depreciation", amount: 25000 },
    ]},
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const ProfitAndLoss = () => {
  const calculateTotal = (sections: typeof profitLossData.income | typeof profitLossData.expenses) => {
    return sections.reduce((total, section) => 
      total + section.items.reduce((sectionTotal, item) => sectionTotal + item.amount, 0)
    , 0);
  };

  const totalIncome = calculateTotal(profitLossData.income);
  const totalExpenses = calculateTotal(profitLossData.expenses);
  const profitBeforeTax = totalIncome - totalExpenses;
  const taxRate = 0.3; // 30% tax rate
  const taxAmount = profitBeforeTax * taxRate;
  const netProfit = profitBeforeTax - taxAmount;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Profit & Loss Statement</h1>
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
              {/* Income */}
              <TableRow className="font-semibold">
                <TableCell colSpan={2}>Income</TableCell>
              </TableRow>
              {profitLossData.income.map((section) => (
                <>
                  <TableRow key={section.name} className="bg-muted/50">
                    <TableCell className="font-medium">{section.name}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  {section.items.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="pl-8">{item.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
              <TableRow className="font-semibold">
                <TableCell>Total Income</TableCell>
                <TableCell className="text-right">{formatCurrency(totalIncome)}</TableCell>
              </TableRow>

              {/* Expenses */}
              <TableRow className="font-semibold">
                <TableCell colSpan={2}>Expenses</TableCell>
              </TableRow>
              {profitLossData.expenses.map((section) => (
                <>
                  <TableRow key={section.name} className="bg-muted/50">
                    <TableCell className="font-medium">{section.name}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  {section.items.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="pl-8">{item.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
              <TableRow className="font-semibold">
                <TableCell>Total Expenses</TableCell>
                <TableCell className="text-right">{formatCurrency(totalExpenses)}</TableCell>
              </TableRow>

              {/* Profit & Tax */}
              <TableRow className="font-semibold">
                <TableCell>Profit Before Tax</TableCell>
                <TableCell className="text-right">{formatCurrency(profitBeforeTax)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Tax (30%)</TableCell>
                <TableCell className="text-right">{formatCurrency(taxAmount)}</TableCell>
              </TableRow>
              <TableRow className="font-semibold text-lg">
                <TableCell>Net Profit</TableCell>
                <TableCell className="text-right">{formatCurrency(netProfit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfitAndLoss;