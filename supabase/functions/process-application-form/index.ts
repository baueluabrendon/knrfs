
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract the file data
    const fileData = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(fileData);

    // Send the file to OCR API (we'll use a mock response for now)
    // In a real implementation, you would send the file to a service like Google Cloud Vision API
    // For demo purposes, we'll return mock data
    
    // MOCK OCR RESPONSE - In a real implementation, replace this with actual API call
    const mockExtractedData = {
      firstName: "John",
      middleName: "Robert",
      lastName: "Doe",
      dateOfBirth: "1985-06-12",
      gender: "Male",
      email: "john.doe@example.com",
      phone: "+675 12345678",
      idType: "Passport",
      idNumber: "AB123456",
      employerName: "PNG Corporation Ltd",
      employmentDate: "2018-03-15",
      occupation: "Senior Accountant",
      salary: "75000",
      payDay: "Friday",
      address: "123 Main Street",
      suburb: "Boroko",
      city: "Port Moresby",
      province: "National Capital District",
      postalCode: "121",
      residentialStatus: "Owner",
      yearsAtAddress: "5",
    };

    return new Response(
      JSON.stringify(mockExtractedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing the document' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
