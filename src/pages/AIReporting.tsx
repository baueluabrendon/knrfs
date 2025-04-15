
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIForecastReport from "@/components/ai-reporting/AIForecastReport";
import AIAccountingReport from "@/components/ai-reporting/AIAccountingReport";
import { useQuery } from "@tanstack/react-query";
import { loansApi } from "@/lib/api/loans";
import { repaymentsApi } from "@/lib/api/repayments";
import { accountingApi } from "@/lib/api/accounting";
import { aiApi } from "@/lib/api/ai";
import { Separator } from "@/components/ui/separator"; 
import { AlertTriangle, Loader2, CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AIReporting = () => {
  const [activeTab, setActiveTab] = useState("forecasting");
  const [selectedPeriodId, setSelectedPeriodId] = useState<number>(1); // Default to first period

  // Fetch loans
  const { 
    data: loansData, 
    isLoading: isLoadingLoans,
    error: loansError
  } = useQuery({
    queryKey: ["loans"],
    queryFn: loansApi.getLoans
  });

  // Fetch repayments
  const { 
    data: repaymentsData, 
    isLoading: isLoadingRepayments,
    error: repaymentsError
  } = useQuery({
    queryKey: ["repayments"],
    queryFn: repaymentsApi.getRepayments
  });

  // Fetch fiscal periods first to get the default period
  const { 
    data: fiscalPeriods,
    isLoading: isLoadingPeriods,
    error: periodsError
  } = useQuery({
    queryKey: ["fiscal-periods"],
    queryFn: accountingApi.getFiscalPeriods,
    onSuccess: (data) => {
      if (data?.length > 0 && !selectedPeriodId) {
        setSelectedPeriodId(data[0].period_id);
      }
    }
  });

  // Fetch accounting data
  const { 
    data: profitLossData, 
    isLoading: isLoadingPnL,
    error: pnlError
  } = useQuery({
    queryKey: ["profit-loss", selectedPeriodId],
    queryFn: accountingApi.getProfitAndLoss,
    enabled: !!selectedPeriodId
  });

  const { 
    data: balanceSheetData, 
    isLoading: isLoadingBS,
    error: bsError
  } = useQuery({
    queryKey: ["balance-sheet", selectedPeriodId],
    queryFn: accountingApi.getBalanceSheet,
    enabled: !!selectedPeriodId
  });

  const { 
    data: cashflowData, 
    isLoading: isLoadingCF,
    error: cfError
  } = useQuery({
    queryKey: ["cashflow", selectedPeriodId],
    queryFn: accountingApi.getCashflow,
    enabled: !!selectedPeriodId
  });

  // Determine if any data is loading
  const isLoading = isLoadingLoans || isLoadingRepayments || 
                    isLoadingPnL || isLoadingBS || isLoadingCF;
  
  // Determine if any errors occurred
  const hasErrors = loansError || repaymentsError || pnlError || bsError || cfError || periodsError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Reporting & Analysis</h1>
          <p className="text-muted-foreground">AI-powered insights for loan management and accounting</p>
        </div>
      </div>

      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription>
            There was an error loading some data. AI reports may be incomplete or unavailable.
          </AlertDescription>
        </Alert>
      )}

      <Tabs 
        defaultValue="forecasting" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="accounting">Accounting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="forecasting" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <AIForecastReport
              loanData={loansData}
              repaymentData={repaymentsData}
            />
          )}
        </TabsContent>
        
        <TabsContent value="accounting" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <AIAccountingReport
              profitLossData={profitLossData}
              balanceSheetData={balanceSheetData}
              cashflowData={cashflowData}
              fiscalPeriods={fiscalPeriods}
              onPeriodChange={(periodId) => setSelectedPeriodId(periodId)}
              selectedPeriodId={selectedPeriodId}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIReporting;
