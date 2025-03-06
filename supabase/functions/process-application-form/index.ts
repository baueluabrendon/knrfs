
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

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
    
    // Get the form data from the request
    const formData = await req.formData();
    const file = formData.get("file");
    const applicationUuid = formData.get("applicationUuid");
    
    if (!file || !(file instanceof File)) {
      throw new Error("No file provided or invalid file");
    }
    
    console.log("Received file:", file.name, "size:", file.size, "type:", file.type);
    console.log("Application UUID:", applicationUuid);
    
    // In a real implementation, you would:
    // 1. Call an OCR service (e.g., Google Cloud Vision, Amazon Textract, etc.)
    // 2. Process the response to extract relevant information
    
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
    
    // If application UUID is provided, update the database record
    if (applicationUuid) {
      try {
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://mhndkefbyvxasvayigvx.supabase.co";
        const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obmRrZWZieXZ4YXN2YXlpZ3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNTY3OTksImV4cCI6MjA1NjYzMjc5OX0.2hZ5PqNpNg6F6Q3q8o-W9fOrnqXpBFXe_On247krKYU";
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Update the application record with the extracted data
        const { error } = await supabase
          .from('applications')
          .update({ jsonb_data: mockExtractedData })
          .eq('application_id', applicationUuid);
        
        if (error) {
          console.error("Error updating application record:", error);
        } else {
          console.log("Successfully updated application record with extracted data");
        }
      } catch (dbError) {
        console.error("Database update error:", dbError);
      }
    }
    
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
