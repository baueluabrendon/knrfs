
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Configure CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Handle the HTTP request
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log("Received request to process application form");
    
    // In a real implementation, you would:
    // 1. Extract the form data
    // 2. Get the file from the form data
    // 3. Call an OCR service (e.g., Google Cloud Vision, Amazon Textract, etc.)
    // 4. Process the response to extract relevant information
    
    // For now, we'll return mock data
    const mockExtractedData = {
      firstName: "John",
      middleName: "Robert",
      lastName: "Doe",
      dateOfBirth: "1990-01-15",
      gender: "Male",
      email: "john.doe@example.com",
      phone: "+675 7654 3210",
      idType: "National ID",
      idNumber: "ID12345678",
      employerName: "Pacific Industries Ltd",
      employmentDate: "2018-06-01",
      occupation: "Senior Accountant",
      salary: "75000",
      payDay: "15",
      address: "123 Harbor Street",
      suburb: "Seaside",
      city: "Port Moresby",
      province: "National Capital District",
      postalCode: "111",
      residentialStatus: "Owner",
      yearsAtAddress: "5",
      monthlyIncome: "6250",
      otherIncome: "1000",
      totalExpenses: "3500",
      loanAmount: "10000",
      loanPurpose: "Home Renovation",
      loanTerm: "24",
      interest: "2400",
      interestRate: "24",
      loanRiskInsurance: "200",
      documentationFee: "50",
      fortnightlyInstallment: "527.08",
      grossLoan: "12650"
    };
    
    console.log("Returning extracted data", mockExtractedData);
    
    return new Response(JSON.stringify(mockExtractedData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error processing form:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
