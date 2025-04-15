
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, AlertTriangle } from 'lucide-react';
import { aiApi, ForecastParams } from '@/lib/api/ai';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface AIForecastReportProps {
  loanData?: any;
  repaymentData?: any;
}

const AIForecastReport: React.FC<AIForecastReportProps> = ({ loanData, repaymentData }) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [forecastResult, setForecastResult] = useState<string | null>(null);

  const generateForecast = async () => {
    setIsGenerating(true);
    try {
      // Prepare context data from props
      const contextData = {
        loans: loanData || [],
        repayments: repaymentData || [],
        today: format(new Date(), 'yyyy-MM-dd')
      };

      const params: ForecastParams = {
        timeframe,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      };

      const result = await aiApi.generateForecast(params, contextData);
      setForecastResult(result.message);
    } catch (error) {
      console.error("Failed to generate forecast:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI Forecast Report</CardTitle>
        <div className="flex space-x-2">
          <Select value={timeframe} onValueChange={(val: any) => setTimeframe(val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={generateForecast}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Forecast
          </Button>
          {forecastResult && (
            <Button variant="outline" onClick={() => {
              // Download logic would go here
              const blob = new Blob([forecastResult], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `forecast-report-${timeframe}-${format(new Date(), 'yyyyMMdd')}.txt`;
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
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Generating AI forecast report...</p>
          </div>
        ) : forecastResult ? (
          <div className="whitespace-pre-wrap">
            {forecastResult.split(/\n\n/).map((paragraph, i) => {
              if (paragraph.startsWith('#')) {
                // Handle headings
                const level = paragraph.match(/^#+/)[0].length;
                const text = paragraph.replace(/^#+\s*/, '');
                const HeadingTag = `h${level + 1}` as keyof JSX.IntrinsicElements;
                return <HeadingTag key={i} className={`font-bold mt-4 mb-2 text-lg`}>{text}</HeadingTag>;
              } else if (paragraph.startsWith('-')) {
                // Handle bullet points
                return (
                  <ul key={i} className="list-disc pl-5 my-2">
                    {paragraph.split('\n').map((item, j) => (
                      <li key={j}>{item.replace(/^- /, '')}</li>
                    ))}
                  </ul>
                );
              } else if (paragraph.includes('Risk') || paragraph.includes('Warning') || 
                        paragraph.includes('Alert')) {
                // Handle warnings/alerts
                return (
                  <div key={i} className="bg-amber-50 border border-amber-200 p-4 rounded-md my-4 flex">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                    <p>{paragraph}</p>
                  </div>
                );
              } else {
                // Regular paragraphs
                return <p key={i} className="mb-4">{paragraph}</p>;
              }
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Select a timeframe and click "Generate Forecast" to create an AI-powered forecast report.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIForecastReport;
