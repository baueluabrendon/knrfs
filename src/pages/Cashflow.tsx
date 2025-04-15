import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Printer, Loader2 } from "lucide-react";
import { accountingApi } from "@/lib/api/accounting";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

type CashflowItem = {
  name: string;
  amount: number;
};

type CashflowData = {
  operating: CashflowItem[];
  investing: CashflowItem[];
  financing: CashflowItem[];
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always',
  }).format(amount);
};

const Cashflow = () => {
  const [periodId, setPeriodId] = useState<number | null>(null);
  
  // Fetch fiscal periods
  const { data: fiscalPeriods, isLoading: isLoadingPeriods } = useQuery({
    queryKey: ['fiscal-periods'],
    queryFn: accountingApi.getFiscalPeriods
  });

  // Fetch cashflow data based on selected period
  const { data: cashflowData, isLoading: isLoadingCashflow } = useQuery<CashflowData, Error>({
    queryKey: ['cashflow', periodId],
    queryFn: () => accountingApi.getCashflow(periodId),
    enabled: periodId !== null
  });

  // Select first period by default when data loads
  useEffect(() => {
    if (fiscalPeriods && fiscalPeriods.length > 0 && !periodId) {
      setPeriodId(fiscalPeriods[0].period_id);
    }
  }, [fiscalPeriods, periodId]);

  // Handle organized data for display
  const operatingCashflow = cashflowData?.operating || [];
  const investingCashflow = cashflowData?.investing || [];
  const financingCashflow = cashflowData?.financing || [];
  
  const operatingTotal = operatingCashflow.reduce((sum, item) => sum + Number(item.amount), 0);
  const investingTotal = investingCashflow.reduce((sum, item) => sum + Number(item.amount), 0);
  const financingTotal = financingCashflow.reduce((sum, item) => sum + Number(item.amount), 0);
  const netCashflow = operatingTotal + investingTotal + financingTotal;

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle download
  const handleDownload = () => {
    try {
      // Generate CSV content
      const headers = ['Category', 'Description', 'Amount'];
      let csvContent = headers.join(',') + '\n';
      
      // Operating Activities
      csvContent += '"Cash Flows from Operating Activities","",""' + '\n';
      operatingCashflow.forEach(item => {
        csvContent += `"","${item.name}","${item.amount}"` + '\n';
      });
      csvContent += `"Net Cash from Operating Activities","","${operatingTotal}"` + '\n';
      
      // Investing Activities
      csvContent += '"Cash Flows from Investing Activities","",""' + '\n';
      investingCashflow.forEach(item => {
        csvContent += `"","${item.name}","${item.amount}"` + '\n';
      });
      csvContent += `"Net Cash from Investing Activities","","${investingTotal}"` + '\n';
      
      // Financing Activities
      csvContent += '"Cash Flows from Financing Activities","",""' + '\n';
      financingCashflow.forEach(item => {
        csvContent += `"","${item.name}","${item.amount}"` + '\n';
      });
      csvContent += `"Net Cash from Financing Activities","","${financingTotal}"` + '\n';
      
      // Net Change in Cash
      csvContent += `"Net Increase/(Decrease) in Cash","","${netCashflow}"` + '\n';
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `cashflow-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Cashflow statement downloaded successfully");
    } catch (error) {
      console.error("Error downloading cashflow statement:", error);
      toast.error("Failed to download cashflow statement");
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

  const selectedPeriod = fiscalPeriods?.find(p => p.period_id === periodId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Statement of Cash Flows</h1>
        <div className="flex space-x-2">
          <Select value={periodId?.toString()} onValueChange={(value) => setPeriodId(parseInt(value))}>
            <SelectTrigger className="w-[250px]">
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

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Statement of Cash Flows</h2>
          <p className="text-sm text-muted-foreground">
            For the period {selectedPeriod ? `${format(new Date(selectedPeriod.start_date), 'MMMM d')} to ${format(new Date(selectedPeriod.end_date), 'MMMM d, yyyy')}` : 'Loading...'}
          </p>
        </div>

        {isLoadingCashflow ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading cashflow data...</span>
          </div>
        ) : (
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
              {operatingCashflow.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="pl-8">{item.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(item.amount))}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>Net Cash from Operating Activities</TableCell>
                <TableCell className="text-right">{formatCurrency(operatingTotal)}</TableCell>
              </TableRow>

              {/* Investing Activities */}
              <TableRow className="font-semibold">
                <TableCell colSpan={2}>Cash Flows from Investing Activities</TableCell>
              </TableRow>
              {investingCashflow.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="pl-8">{item.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(item.amount))}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>Net Cash from Investing Activities</TableCell>
                <TableCell className="text-right">{formatCurrency(investingTotal)}</TableCell>
              </TableRow>

              {/* Financing Activities */}
              <TableRow className="font-semibold">
                <TableCell colSpan={2}>Cash Flows from Financing Activities</TableCell>
              </TableRow>
              {financingCashflow.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="pl-8">{item.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(item.amount))}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>Net Cash from Financing Activities</TableCell>
                <TableCell className="text-right">{formatCurrency(financingTotal)}</TableCell>
              </TableRow>

              {/* Net Change in Cash */}
              <TableRow className="font-semibold text-lg">
                <TableCell>Net Increase/(Decrease) in Cash</TableCell>
                <TableCell className="text-right">{formatCurrency(netCashflow)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default Cashflow;
