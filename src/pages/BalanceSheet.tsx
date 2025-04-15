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

type AssetLiabilityItem = {
  name: string;
  amount: number;
};

type BalanceSheetData = {
  assets: AssetLiabilityItem[];
  liabilities: AssetLiabilityItem[];
  equity: AssetLiabilityItem[];
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const BalanceSheet = () => {
  const [periodId, setPeriodId] = useState<number | null>(null);
  
  // Fetch fiscal periods
  const { data: fiscalPeriods, isLoading: isLoadingPeriods } = useQuery({
    queryKey: ['fiscal-periods'],
    queryFn: accountingApi.getFiscalPeriods
  });

  // Fetch balance sheet data based on selected period
  const { data: balanceSheetData, isLoading: isLoadingBalanceSheet } = useQuery<BalanceSheetData, Error>({
    queryKey: ['balance-sheet', periodId],
    queryFn: () => accountingApi.getBalanceSheet(periodId),
    enabled: periodId !== null
  });

  // Select first period by default when data loads
  useEffect(() => {
    if (fiscalPeriods && fiscalPeriods.length > 0 && !periodId) {
      setPeriodId(fiscalPeriods[0].period_id);
    }
  }, [fiscalPeriods, periodId]);

  // Handle organized data for display
  const assets = balanceSheetData?.assets || [];
  const liabilities = balanceSheetData?.liabilities || [];
  const equity = balanceSheetData?.equity || [];
  
  const totalAssets = assets.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalEquity = equity.reduce((sum, item) => sum + Number(item.amount), 0);

  // Group assets by category
  const assetCategories = assets.reduce((acc, item) => {
    const category = item.name.includes('Current') ? 'Current Assets' : 'Non-Current Assets';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, AssetLiabilityItem[]>);

  // Group liabilities by category
  const liabilityCategories = liabilities.reduce((acc, item) => {
    const category = item.name.includes('Current') ? 'Current Liabilities' : 'Non-Current Liabilities';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, AssetLiabilityItem[]>);

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle download
  const handleDownload = () => {
    try {
      // Generate CSV content
      const headers = ['Category', 'Account', 'Amount'];
      let csvContent = headers.join(',') + '\n';
      
      // Assets
      csvContent += '"ASSETS","",""' + '\n';
      Object.entries(assetCategories).forEach(([category, items]) => {
        csvContent += `"${category}","",""` + '\n';
        items.forEach(item => {
          csvContent += `"","${item.name}","${item.amount}"` + '\n';
        });
      });
      csvContent += `"Total Assets","","${totalAssets}"` + '\n';
      
      // Liabilities
      csvContent += '"LIABILITIES","",""' + '\n';
      Object.entries(liabilityCategories).forEach(([category, items]) => {
        csvContent += `"${category}","",""` + '\n';
        items.forEach(item => {
          csvContent += `"","${item.name}","${item.amount}"` + '\n';
        });
      });
      csvContent += `"Total Liabilities","","${totalLiabilities}"` + '\n';
      
      // Equity
      csvContent += '"EQUITY","",""' + '\n';
      equity.forEach(item => {
        csvContent += `"","${item.name}","${item.amount}"` + '\n';
      });
      csvContent += `"Total Equity","","${totalEquity}"` + '\n';
      csvContent += `"Total Liabilities and Equity","","${totalLiabilities + totalEquity}"` + '\n';
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `balance-sheet-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Balance sheet downloaded successfully");
    } catch (error) {
      console.error("Error downloading balance sheet:", error);
      toast.error("Failed to download balance sheet");
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
        <h1 className="text-2xl font-semibold">Balance Sheet</h1>
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
          <h2 className="text-lg font-semibold">Balance Sheet</h2>
          <p className="text-sm text-muted-foreground">
            As of {selectedPeriod ? format(new Date(selectedPeriod.end_date), 'MMMM d, yyyy') : 'Loading...'}
          </p>
        </div>
        
        {isLoadingBalanceSheet ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading balance sheet data...</span>
          </div>
        ) : (
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
              
              {Object.entries(assetCategories).map(([category, items]) => (
                <React.Fragment key={category}>
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-medium">{category}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  {items.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="pl-8">{item.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(item.amount))}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              
              <TableRow className="font-semibold">
                <TableCell>Total Assets</TableCell>
                <TableCell className="text-right">{formatCurrency(totalAssets)}</TableCell>
              </TableRow>

              {/* Liabilities */}
              <TableRow className="font-semibold">
                <TableCell colSpan={2}>Liabilities</TableCell>
              </TableRow>
              
              {Object.entries(liabilityCategories).map(([category, items]) => (
                <React.Fragment key={category}>
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-medium">{category}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  {items.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="pl-8">{item.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(item.amount))}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              
              <TableRow className="font-semibold">
                <TableCell>Total Liabilities</TableCell>
                <TableCell className="text-right">{formatCurrency(totalLiabilities)}</TableCell>
              </TableRow>

              {/* Equity */}
              <TableRow className="font-semibold">
                <TableCell colSpan={2}>Equity</TableCell>
              </TableRow>
              
              {equity.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="pl-8">{item.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(item.amount))}</TableCell>
                </TableRow>
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
        )}
      </Card>
    </div>
  );
};

export default BalanceSheet;
