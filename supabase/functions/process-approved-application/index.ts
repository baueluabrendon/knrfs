
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import vision from 'npm:@google-cloud/vision@3.1.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Google Cloud Vision client
let visionClient: any = null;

function initVisionClient() {
  if (visionClient) return visionClient;
  
  try {
    const googleCredentials = JSON.parse(Deno.env.get('GOOGLE_VISION_CREDENTIALS') || '{}');
    visionClient = new vision.ImageAnnotatorClient({
      credentials: googleCredentials
    });
    console.log('Google Vision API client initialized successfully');
    return visionClient;
  } catch (error) {
    console.error('Error initializing Google Vision API client:', error);
    throw new Error('Failed to initialize Google Vision API client');
  }
}

// Process application form image using Google Vision OCR
async function processApplicationFormWithVision(imageUrl: string) {
  console.log('Processing application form with Google Vision API:', imageUrl);
  
  try {
    const client = initVisionClient();
    const [result] = await client.textDetection(imageUrl);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      throw new Error('No text detected in the application form');
    }
    
    const extractedText = detections[0].description;
    console.log('Extracted text from application form (first 200 chars):', extractedText.substring(0, 200));
    
    // Parse the extracted text to get structured data
    const extractedData = {
      personalDetails: {
        firstName: extractValue(extractedText, 'first name', 20),
        lastName: extractValue(extractedText, 'last name', 20),
        dateOfBirth: extractValue(extractedText, 'date of birth', 10),
        email: extractValue(extractedText, 'email', 30),
        phone: extractValue(extractedText, 'phone', 15),
        gender: extractValue(extractedText, 'gender', 10),
        nationality: extractValue(extractedText, 'nationality', 20),
        maritalStatus: extractValue(extractedText, 'marital status', 15),
      },
      employmentDetails: {
        employerName: extractValue(extractedText, 'employer', 30),
        position: extractValue(extractedText, 'position', 30),
        employmentDate: extractValue(extractedText, 'employment date', 10),
        fileNumber: extractValue(extractedText, 'file number', 20),
        paymaster: extractValue(extractedText, 'paymaster', 30),
        workPhoneNumber: extractValue(extractedText, 'work phone', 15),
      },
      residentialDetails: {
        address: extractValue(extractedText, 'address', 50),
        city: extractValue(extractedText, 'city', 20),
        province: extractValue(extractedText, 'province', 20),
        district: extractValue(extractedText, 'district', 20),
        village: extractValue(extractedText, 'village', 20),
        suburb: extractValue(extractedText, 'suburb', 20),
      },
      financialDetails: {
        income: extractValue(extractedText, 'income', 15),
        loanAmount: extractValue(extractedText, 'loan amount', 15),
        loanTerm: extractValue(extractedText, 'loan term', 10),
        bank: extractValue(extractedText, 'bank', 20),
        accountNumber: extractValue(extractedText, 'account number', 20),
      }
    };
    
    return extractedData;
  } catch (error) {
    console.error('Error processing application form with Google Vision:', error);
    throw error;
  }
}

// Helper function to extract values from text
function extractValue(text: string, label: string, maxLength: number): string {
  const regex = new RegExp(`${label}[\\s:\\-]*([^\\n]{1,${maxLength}})`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the request body
    const { record } = await req.json();
    
    console.log('Received record:', JSON.stringify(record));

    // Ensure we have a valid record
    if (!record || !record.application_id) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: missing application data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Validate that the record contains a valid application_document_url
    if (!record.application_document_url || record.application_document_url.trim() === '') {
      console.error('Missing application_document_url in request:', record);
      return new Response(
        JSON.stringify({ error: 'No valid application document URL found. Please upload the document first.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Processing application:', record.application_id);
    console.log('Document URL:', record.application_document_url);
    
    // Check if the application has already processed data
    let applicationData = record.jsonb_data;
    
    if (!applicationData) {
      console.log('Processing document with Google Vision');
      try {
        applicationData = await processApplicationFormWithVision(record.application_document_url);
        
        // Important change: Do NOT update the application with the OCR data
        // The data will only be used to prefill the form, not saved to database yet
        console.log('Successfully processed document with Google Vision');
      } catch (error) {
        console.error('Failed to process document with Google Vision:', error);
        applicationData = {};
      }
    } else {
      console.log('Using existing data from application record');
    }
    
    // Return success response with the processed data
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Application processed successfully',
        data: applicationData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error processing application:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred while processing the application' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
