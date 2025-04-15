
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
import { Download, Printer, MessageSquare, Loader2, XCircle } from "lucide-react";
import { aiApi } from "@/lib/api/ai";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ProfitAndLoss = () => {
  const [period, setPeriod] = useState("current-month");
  const [view, setView] = useState("summary");
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

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
    toast.success("Report download started");
  };

  const handleGenerateInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const reportData = {
        view,
        period,
        data: view === 'summary' ? summaryData : detailedData
      };

      const params = {
        reportType: 'pnl',
        timeframe: period === 'year-to-date' ? 'yearly' : 
                   period === 'quarter' ? 'quarterly' : 'monthly'
      };
      
      const result = await aiApi.generateAccountingReport(params, reportData);
      setAiInsights(result.message);
      setShowAiInsights(true);
    } catch (error) {
      console.error("Failed to generate insights:", error);
      toast.error("Failed to generate AI insights");
    } finally {
      setIsLoadingInsights(false);
    }
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

        <Button 
          variant={showAiInsights ? "secondary" : "default"}
          className="w-full md:w-auto"
          onClick={showAiInsights ? () => setShowAiInsights(false) : handleGenerateInsights}
          disabled={isLoadingInsights}
        >
          {isLoadingInsights ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : showAiInsights ? (
            <XCircle className="mr-2 h-4 w-4" />
          ) : (
            <MessageSquare className="mr-2 h-4 w-4" />
          )}
          {showAiInsights ? "Hide AI Insights" : "Generate AI Insights"}
        </Button>
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

        {showAiInsights && aiInsights && (
          <div className="mt-8 border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                AI Insights
              </h3>
              <Badge variant="outline" className="text-xs">AI Generated</Badge>
            </div>
            <div className="prose max-w-none">
              {aiInsights.split(/\n\n/).map((paragraph, i) => {
                if (paragraph.startsWith('#')) {
                  const level = paragraph.match(/^#+/)[0].length;
                  const text = paragraph.replace(/^#+\s*/, '');
                  const HeadingTag = `h${level + 3}` as keyof JSX.IntrinsicElements;
                  return <HeadingTag key={i} className="font-bold mt-4 mb-2">{text}</HeadingTag>;
                } else if (paragraph.startsWith('-')) {
                  return (
                    <ul key={i} className="list-disc pl-5 my-2">
                      {paragraph.split('\n').map((item, j) => (
                        <li key={j}>{item.replace(/^- /, '')}</li>
                      ))}
                    </ul>
                  );
                } else {
                  return <p key={i} className="mb-4">{paragraph}</p>;
                }
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfitAndLoss;
