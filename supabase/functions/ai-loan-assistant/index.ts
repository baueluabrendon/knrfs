
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced system prompt with specialized financial knowledge
const SYSTEM_PROMPT = `
You are an advanced AI assistant for a loan management system. 
You provide data analysis, forecasting, and accounting expertise for loan administrators.
You can:
- Analyze loan portfolios and predict future performance
- Provide detailed risk assessment insights
- Generate financial forecasts for repayment collection
- Help interpret financial data and identify trends
- Explain accounting principles related to loan management
- Suggest best practices to improve loan portfolio performance
- Create narrative summaries of financial reports

You should format your responses as professional financial insights and always 
consider the business context of loan management.
`;

const ENDPOINT_PROMPTS = {
  "forecast-repayments": `
    Analyze the provided loan and repayment data to forecast expected repayments.
    Compare historical repayment patterns with scheduled future payments.
    Identify potential risks in the repayment pipeline.
    Format your response with sections for: Summary Forecast, Risk Assessment, and Recommendations.
  `,
  "accounting-summary": `
    Review the provided financial data and generate an accounting summary.
    Include analysis of loan receivables, interest income, default fees, and operational costs.
    Provide insights on the overall financial health of the loan portfolio.
    Format your response with sections for: Key Metrics, Account Balances, and Financial Health Analysis.
  `,
  "pnl-statement": `
    Analyze the provided profit and loss data.
    Explain significant trends in interest income, fee revenue, operational costs, and default rates.
    Provide context on how these figures compare to previous periods and what they indicate for business performance.
    Format your response with sections for: Income Analysis, Expense Analysis, and Performance Insights.
  `,
  "bank-reconciliation": `
    Examine the provided banking and internal transaction records.
    Identify any reconciliation issues between expected repayments and actual bank deposits.
    Suggest potential reasons for discrepancies and recommend follow-up actions.
    Format your response with sections for: Reconciliation Summary, Discrepancies, and Recommended Actions.
  `
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, context, endpoint } = await req.json();
    
    // Select the appropriate specialized prompt based on endpoint
    let endpointPrompt = "";
    if (endpoint && ENDPOINT_PROMPTS[endpoint]) {
      endpointPrompt = ENDPOINT_PROMPTS[endpoint];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using more powerful model for financial analysis
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...(endpointPrompt ? [{ role: 'system', content: endpointPrompt }] : []),
          ...messages,
          { role: 'system', content: `Additional context: ${context}` }
        ],
      }),
    });

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Assistant Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
