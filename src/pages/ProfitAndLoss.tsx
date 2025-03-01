import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Printer } from "lucide-react";

const ProfitAndLoss = () => {
  const [period, setPeriod] = useState("current-month");
  const [view, setView] = useState("summary");

  // Sample data - would come from API in real app
  const summaryData = [
    { category: "Revenue", amount: 125000 },
    { category: "Cost of Sales", amount: -45000 },
    { category: "Gross Profit", amount: 80000, isTotal: true },
    { category: "Operating Expenses", amount: -35000 },
    { category: "Administrative Expenses", amount: -15000 },
    { category: "Other Income", amount: 2000 },
    { category: "Net Profit", amount: 32000, isTotal: true },
  ];

  const detailedData = [
    { category: "Revenue", subcategory: "Loan Interest Income", amount: 95000 },
    { category: "Revenue", subcategory: "Application Fees", amount: 15000 },
    { category: "Revenue", subcategory: "Late Payment Fees", amount: 10000 },
    { category: "Revenue", subcategory: "Other Fees", amount: 5000 },
    { category: "Cost of Sales", subcategory: "Interest Expense", amount: -30000 },
    { category: "Cost of Sales", subcategory: "Loan Origination Costs", amount: -15000 },
    { category: "Operating Expenses", subcategory: "Salaries", amount: -25000 },
    { category: "Operating Expenses", subcategory: "Marketing", amount: -5000 },
    { category: "Operating Expenses", subcategory: "Office Supplies", amount: -5000 },
    { category: "Administrative Expenses", subcategory: "Rent", amount: -8000 },
    { category: "Administrative Expenses", subcategory: "Utilities", amount: -2000 },
    { category: "Administrative Expenses", subcategory: "Insurance", amount: -3000 },
    { category: "Administrative Expenses", subcategory: "Professional Fees", amount: -2000 },
    { category: "Other Income", subcategory: "Interest on Deposits", amount: 2000 },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a CSV or PDF
    console.log("Downloading report...");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profit and Loss Statement</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-month">Current Month</SelectItem>
            <SelectItem value="previous-month">Previous Month</SelectItem>
            <SelectItem value="quarter">Current Quarter</SelectItem>
            <SelectItem value="year-to-date">Year to Date</SelectItem>
            <SelectItem value="previous-year">Previous Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summary">Summary View</SelectItem>
            <SelectItem value="detailed">Detailed View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Profit and Loss Statement - {period === "current-month" ? "Current Month" : 
                                      period === "previous-month" ? "Previous Month" : 
                                      period === "quarter" ? "Current Quarter" : 
                                      period === "year-to-date" ? "Year to Date" : "Previous Year"}
        </h2>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Category</TableHead>
              {view === "detailed" && <TableHead className="w-[300px]">Subcategory</TableHead>}
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {view === "summary" ? (
              summaryData.map((item, index) => (
                <TableRow key={index} className={item.isTotal ? "font-bold bg-muted/50" : ""}>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">
                    {item.amount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              detailedData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.subcategory}</TableCell>
                  <TableCell className="text-right">
                    {item.amount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ProfitAndLoss;
