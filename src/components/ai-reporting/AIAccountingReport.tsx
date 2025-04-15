
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, HelpCircle } from 'lucide-react';
import { aiApi, AccountingParams } from '@/lib/api/ai';
import { format } from 'date-fns';
import { FiscalPeriod, BalanceSheetData, ProfitLossData, CashflowData } from '@/lib/api/types';

interface AIAccountingReportProps {
  profitLossData?: ProfitLossData;
  balanceSheetData?: BalanceSheetData;
  cashflowData?: CashflowData;
  fiscalPeriods?: FiscalPeriod[];
  selectedPeriodId?: number;
  onPeriodChange?: (periodId: number) => void;
}

const AIAccountingReport: React.FC<AIAccountingReportProps> = ({ 
  profitLossData, 
  balanceSheetData, 
  cashflowData,
  fiscalPeriods,
  selectedPeriodId,
  onPeriodChange
}) => {
  const [reportType, setReportType] = useState<'summary' | 'pnl' | 'reconciliation'>('summary');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [accountingResult, setAccountingResult] = useState<string | null>(null);
  
  // Set default period if needed
  useEffect(() => {
    if (fiscalPeriods?.length && !selectedPeriodId && onPeriodChange) {
      onPeriodChange(fiscalPeriods[0].period_id);
    }
  }, [fiscalPeriods, selectedPeriodId, onPeriodChange]);

  const generateReport = async () => {
    if (!selectedPeriodId) return;
    
    setIsGenerating(true);
    try {
      // Prepare accounting data based on the report type
      let accountingData = {};
      
      const selectedPeriod = fiscalPeriods?.find(p => p.period_id === selectedPeriodId);
      
      switch (reportType) {
        case 'pnl':
          accountingData = {
            profitLoss: profitLossData || {},
            timeframe,
            today: format(new Date(), 'yyyy-MM-dd')
          };
          break;
        case 'reconciliation':
          accountingData = {
            cashflow: cashflowData || {},
            timeframe,
            today: format(new Date(), 'yyyy-MM-dd')
          };
          break;
        default: // summary
          accountingData = {
            profitLoss: profitLossData || {},
            balanceSheet: balanceSheetData || {},
            cashflow: cashflowData || {},
            timeframe,
            today: format(new Date(), 'yyyy-MM-dd')
          };
      }

      const params: AccountingParams = {
        reportType,
        timeframe,
        startDate: selectedPeriod?.start_date || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        endDate: selectedPeriod?.end_date || format(new Date(), 'yyyy-MM-dd')
      };

      const result = await aiApi.generateAccountingReport(params, accountingData);
      setAccountingResult(result.message);
    } catch (error) {
      console.error("Failed to generate accounting report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>AI Accounting Report</CardTitle>
        <div className="flex space-x-2">
          {fiscalPeriods && fiscalPeriods.length > 0 && onPeriodChange && (
            <Select 
              value={selectedPeriodId?.toString()} 
              onValueChange={(value) => onPeriodChange(parseInt(value))}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {fiscalPeriods.map((period) => (
                  <SelectItem key={period.period_id} value={period.period_id.toString()}>
                    {period.period_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        
          <Button 
            variant="outline" 
            onClick={generateReport}
            disabled={isGenerating || !selectedPeriodId}
          >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Report
          </Button>
          
          {accountingResult && (
            <Button variant="outline" onClick={() => {
              const blob = new Blob([accountingResult], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${reportType}-report-${format(new Date(), 'yyyyMMdd')}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <div className="text-sm font-medium mb-2">Report Type</div>
              <Tabs 
                defaultValue="summary"
                value={reportType}
                onValueChange={(v) => setReportType(v as any)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="pnl">P&L Statement</TabsTrigger>
                  <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="w-full sm:w-1/2">
              <div className="text-sm font-medium mb-2">Timeframe</div>
              <Select value={timeframe} onValueChange={(val: any) => setTimeframe(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/40 p-4 rounded-lg">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Generating AI accounting report...
                </p>
              </div>
            ) : accountingResult ? (
              <div className="whitespace-pre-wrap">
                {accountingResult.split(/\n\n/).map((paragraph, i) => {
                  if (paragraph.startsWith('#')) {
                    const level = paragraph.match(/^#+/)[0].length;
                    const text = paragraph.replace(/^#+\s*/, '');
                    switch (level) {
                      case 1:
                        return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{text}</h2>;
                      case 2:
                        return <h3 key={i} className="text-lg font-semibold mt-3 mb-1">{text}</h3>;
                      default:
                        return <h4 key={i} className="text-base font-medium mt-2 mb-1">{text}</h4>;
                    }
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
            ) : (
              <div className="flex items-center justify-center py-12 text-center">
                <div className="max-w-md">
                  <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/60" />
                  <h3 className="mt-4 text-lg font-medium">AI Accounting Insights</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select your report preferences and click "Generate Report" to create an 
                    AI-powered accounting analysis with narrative explanations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAccountingReport;
