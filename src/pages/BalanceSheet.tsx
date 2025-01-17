import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const balanceSheetData = {
  assets: [
    { name: "Current Assets", items: [
      { name: "Cash and Cash Equivalents", amount: 150000 },
      { name: "Accounts Receivable", amount: 75000 },
      { name: "Loans Receivable", amount: 500000 },
    ]},
    { name: "Non-Current Assets", items: [
      { name: "Property and Equipment", amount: 200000 },
      { name: "Intangible Assets", amount: 50000 },
    ]},
  ],
  liabilities: [
    { name: "Current Liabilities", items: [
      { name: "Accounts Payable", amount: 45000 },
      { name: "Short-term Loans", amount: 100000 },
    ]},
    { name: "Non-Current Liabilities", items: [
      { name: "Long-term Debt", amount: 300000 },
    ]},
  ],
  equity: [
    { name: "Shareholders' Equity", items: [
      { name: "Share Capital", amount: 400000 },
      { name: "Retained Earnings", amount: 130000 },
    ]},
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const BalanceSheet = () => {
  const calculateTotal = (sections: typeof balanceSheetData.assets) => {
    return sections.reduce((total, section) => 
      total + section.items.reduce((sectionTotal, item) => sectionTotal + item.amount, 0)
    , 0);
  };

  const totalAssets = calculateTotal(balanceSheetData.assets);
  const totalLiabilities = calculateTotal(balanceSheetData.liabilities);
  const totalEquity = calculateTotal(balanceSheetData.equity);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Balance Sheet</h1>
          <p className="text-sm text-muted-foreground">As of {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Assets */}
              <TableRow className="font-semibold">
                <TableCell colSpan={2}>Assets</TableCell>
              </TableRow>
              {balanceSheetData.assets.map((section) => (
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
                <TableCell>Total Assets</TableCell>
                <TableCell className="text-right">{formatCurrency(totalAssets)}</TableCell>
              </TableRow>

              {/* Liabilities */}
              <TableRow className="font-semibold">
                <TableCell colSpan={2}>Liabilities</TableCell>
              </TableRow>
              {balanceSheetData.liabilities.map((section) => (
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
                <TableCell>Total Liabilities</TableCell>
                <TableCell className="text-right">{formatCurrency(totalLiabilities)}</TableCell>
              </TableRow>

              {/* Equity */}
              <TableRow className="font-semibold">
                <TableCell colSpan={2}>Equity</TableCell>
              </TableRow>
              {balanceSheetData.equity.map((section) => (
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
                <TableCell>Total Equity</TableCell>
                <TableCell className="text-right">{formatCurrency(totalEquity)}</TableCell>
              </TableRow>

              {/* Total Liabilities and Equity */}
              <TableRow className="font-semibold text-lg">
                <TableCell>Total Liabilities and Equity</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalLiabilities + totalEquity)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BalanceSheet;