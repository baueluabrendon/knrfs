
import React, { useState, useEffect } from "react";
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
import { aiApi, AccountingParams } from "@/lib/api/ai";
import { accountingApi } from "@/lib/api/accounting";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const ProfitAndLoss = () => {
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [view, setView] = useState("summary");
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  // Fetch fiscal periods
  const { data: fiscalPeriods, isLoading: isLoadingPeriods } = useQuery({
    queryKey: ['fiscal-periods'],
    queryFn: accountingApi.getFiscalPeriods
  });

  // Fetch profit and loss data based on selected period
  const { data: profitLossData, isLoading: isLoadingProfitLoss } = useQuery({
    queryKey: ['profit-loss', periodId],
    queryFn: () => accountingApi.getProfitAndLoss(periodId),
    enabled: periodId !== null
  });

  // Select first period by default when data loads
  useEffect(() => {
    if (fiscalPeriods && fiscalPeriods.length > 0 && !periodId) {
      setPeriodId(fiscalPeriods[0].period_id);
    }
  }, [fiscalPeriods, periodId]);

  // Transform database data into display format
  const formatProfitLossData = () => {
    if (!profitLossData) return { summaryData: [], detailedData: [] };
    
    const revenue = profitLossData.revenue || [];
    const expenses = profitLossData.expenses || [];
    
    // Calculate totals
    const totalRevenue = revenue.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalCostOfSales = expenses
      .filter(item => item.category === 'Cost of Sales')
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const grossProfit = totalRevenue - totalCostOfSales;
    
    const operatingExpenses = expenses
      .filter(item => item.category === 'Operating Expense')
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const adminExpenses = expenses
      .filter(item => item.category === 'Administrative Expense')
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const otherIncome = revenue
      .filter(item => item.category === 'Other Income')
      .reduce((sum, item) => sum + Number(item.amount), 0);
    
    const netProfit = grossProfit - operatingExpenses - adminExpenses + otherIncome;
    
    // Summary data
    const summaryData = [
      { category: "Revenue", amount: totalRevenue },
      { category: "Cost of Sales", amount: -totalCostOfSales },
      { category: "Gross Profit", amount: grossProfit, isTotal: true },
      { category: "Operating Expenses", amount: -operatingExpenses },
      { category: "Administrative Expenses", amount: -adminExpenses },
      { category: "Other Income", amount: otherIncome },
      { category: "Net Profit", amount: netProfit, isTotal: true },
    ];
    
    // Detailed data
    const detailedData = [
      ...revenue.map(item => ({
        category: item.category,
        subcategory: item.name,
        amount: Number(item.amount)
      })),
      ...expenses.map(item => ({
        category: item.category,
        subcategory: item.name,
        amount: -Number(item.amount) // Negative for expenses
      }))
    ];
    
    return { summaryData, detailedData };
  };
  
  const { summaryData, detailedData } = formatProfitLossData();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    try {
      // Generate CSV content
      const headers = view === 'summary' 
        ? ['Category', 'Amount'] 
        : ['Category', 'Subcategory', 'Amount'];
      
      const dataToExport = view === 'summary' ? summaryData : detailedData;
      
      let csvContent = headers.join(',') + '\n';
      
      dataToExport.forEach(row => {
        const values = view === 'summary'
          ? [row.category, row.amount.toFixed(2)]
          : [row.category, row.subcategory, row.amount.toFixed(2)];
        
        csvContent += values.map(value => `"${value}"`).join(',') + '\n';
      });
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `profit-loss-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    }
  };

  const handleGenerateInsights = async () => {
    if (!periodId || !profitLossData) {
      toast.error("No data available to analyze");
      return;
    }

    setIsLoadingInsights(true);
    try {
      const selectedPeriod = fiscalPeriods?.find(p => p.period_id === periodId);

      // Prepare a comprehensive context for the AI
      const reportData = {
        view,
        period: selectedPeriod,
        data: view === 'summary' ? summaryData : detailedData,
        metadata: {
          generatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          businessContext: 'Loan Management Financial Analysis'
        }
      };

      // Explicitly type the params to match AccountingParams
      const params: AccountingParams = {
        reportType: 'pnl',
        timeframe: 'monthly',
        startDate: selectedPeriod?.start_date || format(new Date(), 'yyyy-MM-01'),
        endDate: selectedPeriod?.end_date || format(new Date(), 'yyyy-MM-dd')
      };
      
      // Generate the AI report with comprehensive context
      const result = await aiApi.generateAccountingReport(params, reportData);
      
      // Set the insights and show them
      setAiInsights(result.message);
      setShowAiInsights(true);

      // Save the generated report
      await accountingApi.saveFinancialReport({
        report_type: 'profit_loss',
        period_id: periodId,
        report_data: {
          insights: result.message,
          data: reportData
        },
        notes: `AI-generated P&L insights for ${selectedPeriod?.period_name || 'current period'}`
      });

      // Add a toast notification
      toast.success('AI Insights Generated Successfully', {
        description: 'Detailed financial analysis is now available.'
      });

    } catch (error) {
      console.error("Failed to generate insights:", error);
      toast.error("Failed to generate AI insights", {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  if (isLoadingPeriods) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading financial periods...</span>
      </div>
    );
  }

  if (fiscalPeriods?.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">No Financial Periods Found</h2>
          <p>Please set up financial periods in the accounting system.</p>
        </div>
      </Card>
    );
  }

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
        <Select value={periodId?.toString()} onValueChange={(value) => setPeriodId(parseInt(value))}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {fiscalPeriods?.map((period) => (
              <SelectItem key={period.period_id} value={period.period_id.toString()}>
                {period.period_name} ({format(new Date(period.start_date), 'dd/MM/yyyy')} - {format(new Date(period.end_date), 'dd/MM/yyyy')})
              </SelectItem>
            ))}
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
          disabled={isLoadingInsights || isLoadingProfitLoss}
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
        {isLoadingProfitLoss ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading profit and loss data...</span>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Profit and Loss Statement - {fiscalPeriods?.find(p => p.period_id === periodId)?.period_name || 'Current Period'}
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
          </>
        )}

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
