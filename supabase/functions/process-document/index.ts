
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import vision from "npm:@google-cloud/vision@3.1.3";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Initialize Google Cloud Vision client
const googleCredentials = JSON.parse(Deno.env.get('GOOGLE_VISION_CREDENTIALS') || '{}');
const visionClient = new vision.ImageAnnotatorClient({
  credentials: googleCredentials
});

// Process image document using Google Cloud Vision OCR
async function processImageWithGoogleVision(arrayBuffer) {
  console.log("Processing image with Google Cloud Vision in edge function...");
  
  try {
    // Convert array buffer to base64
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64Image = btoa(String.fromCharCode(...uint8Array));
    
    // Perform OCR with Google Cloud Vision
    const [result] = await visionClient.textDetection({
      image: { content: base64Image }
    });
    
    if (!result || !result.fullTextAnnotation) {
      console.error("No text detected in the image");
      throw new Error("No text could be extracted from the image");
    }
    
    const fullText = result.fullTextAnnotation.text;
    console.log("Vision API extraction complete. First 100 chars:", fullText.substring(0, 100));
    
    return fullText;
  } catch (error) {
    console.error("Error processing image with Google Vision:", error);
    throw error;
  }
}

// Process PDF document using Google Cloud Vision
async function extractTextFromPdf(arrayBuffer) {
  console.log("Extracting text from PDF with Google Cloud Vision in edge function...");
  
  try {
    // Convert array buffer to base64
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64Pdf = btoa(String.fromCharCode(...uint8Array));
    
    // Perform OCR on PDF with Google Cloud Vision
    const [result] = await visionClient.documentTextDetection({
      image: { content: base64Pdf }
    });
    
    if (!result || !result.fullTextAnnotation) {
      console.error("No text detected in the PDF");
      throw new Error("No text could be extracted from the PDF");
    }
    
    const fullText = result.fullTextAnnotation.text;
    console.log("PDF text extraction complete. First 100 chars:", fullText.substring(0, 100));
    
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF with Google Vision:", error);
    throw error;
  }
}

// Parse extracted text to get application data
function parseExtractedText(text) {
  console.log("Parsing extracted text to find application data...");
  
  // Initialize empty object for extracted data
  const extractedData = {};
  
  // Define regex patterns for data extraction
  const patterns = {
    personalDetails: {
      firstName: /First\s*Name:?\s*([A-Za-z\s]+)/i,
      middleName: /Middle\s*Name:?\s*([A-Za-z\s]*)/i,
      lastName: /Last\s*Name:?\s*([A-Za-z\s]+)/i,
      name: /Name:?\s*([A-Za-z\s]+)/i,
      dateOfBirth: /Date\s*of\s*Birth:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\d{4}-\d{2}-\d{2})/i,
      gender: /Gender:?\s*(Male|Female|Other)/i,
      email: /Email:?\s*([\w.-]+@[\w.-]+\.\w+)/i,
      phone: /Phone:?\s*(\+?[\d\s-]+)/i,
      idType: /ID\s*Type:?\s*([A-Za-z\s]+)/i,
      idNumber: /ID\s*Number:?\s*([A-Za-z0-9\s-]+)/i,
      nationality: /Nationality:?\s*([A-Za-z\s]+)/i,
      maritalStatus: /Marital\s*Status:?\s*([A-Za-z\s]+)/i,
    },
    employmentDetails: {
      employerName: /Employer:?\s*([A-Za-z0-9\s.,&]+)/i,
      employmentDate: /Date\s*Employed:?\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\d{4}-\d{2}-\d{2})/i,
      occupation: /Occupation:?\s*([A-Za-z\s]+)/i,
      salary: /Salary:?\s*([\d,]+)/i,
      payDay: /Pay\s*Day:?\s*(\d{1,2})/i,
      fileNumber: /File\s*Number:?\s*([A-Za-z0-9\s-]+)/i,
      position: /Position:?\s*([A-Za-z\s]+)/i,
      workPhoneNumber: /Work\s*Phone:?\s*(\+?[\d\s-]+)/i,
    },
    residentialDetails: {
      address: /Address:?\s*([A-Za-z0-9\s,.]+)/i,
      suburb: /Suburb:?\s*([A-Za-z\s]+)/i,
      city: /City:?\s*([A-Za-z\s]+)/i,
      province: /Province:?\s*([A-Za-z\s]+)/i,
      postalCode: /Postal\s*Code:?\s*(\d+)/i,
      residentialStatus: /Residential\s*Status:?\s*([A-Za-z\s]+)/i,
      yearsAtAddress: /Years\s*at\s*Address:?\s*(\d+)/i,
    },
    financialDetails: {
      monthlyIncome: /Monthly\s*Income:?\s*([\d,.]+)/i,
      otherIncome: /Other\s*Income:?\s*([\d,.]+)/i,
      totalExpenses: /Total\s*Expenses:?\s*([\d,.]+)/i,
      loanAmount: /Loan\s*Amount:?\s*([\d,.]+)/i,
      loanPurpose: /Loan\s*Purpose:?\s*([A-Za-z\s]+)/i,
      loanTerm: /Loan\s*Term:?\s*(\d+)/i,
      interestRate: /Interest\s*Rate:?\s*([\d.]+)/i,
      bank: /Bank:?\s*([A-Za-z\s]+)/i,
      accountNumber: /Account\s*Number:?\s*(\d+)/i,
    }
  };

  // Extract data using regex patterns
  console.log("Applying regex patterns to extract structured data...");
  
  // Extract name field that could contain full name
  const nameMatch = text.match(patterns.personalDetails.name);
  if (nameMatch && nameMatch[1]) {
    const fullName = nameMatch[1].trim().split(' ');
    if (fullName.length >= 1) extractedData.firstName = fullName[0] || '';
    if (fullName.length >= 3) extractedData.middleName = fullName[1] || '';
    if (fullName.length >= 2) extractedData.lastName = fullName[fullName.length - 1] || '';
  }
  
  // Process each category and its fields
  for (const [category, fieldPatterns] of Object.entries(patterns)) {
    // Initialize the category if not exists
    if (!extractedData[category]) extractedData[category] = {};
    
    // Process each field in the category
    for (const [field, pattern] of Object.entries(fieldPatterns)) {
      // Skip name field as it's handled separately
      if (field === 'name') continue;
      
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedData[category][field] = match[1].trim();
      }
    }
  }

  // If first/last name weren't found via direct fields but were extracted from name field,
  // add them to the personalDetails
  if (!extractedData.personalDetails) extractedData.personalDetails = {};
  
  if (extractedData.firstName && !extractedData.personalDetails.firstName) {
    extractedData.personalDetails.firstName = extractedData.firstName;
    delete extractedData.firstName;
  }
  
  if (extractedData.middleName && !extractedData.personalDetails.middleName) {
    extractedData.personalDetails.middleName = extractedData.middleName;
    delete extractedData.middleName;
  }
  
  if (extractedData.lastName && !extractedData.personalDetails.lastName) {
    extractedData.personalDetails.lastName = extractedData.lastName;
    delete extractedData.lastName;
  }

  console.log("Data extraction complete. Fields extracted:", 
    Object.keys(extractedData.personalDetails || {}).length +
    Object.keys(extractedData.employmentDetails || {}).length +
    Object.keys(extractedData.residentialDetails || {}).length +
    Object.keys(extractedData.financialDetails || {}).length
  );
  
  return extractedData;
}

// Main function to process documents and extract data
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get application_id from the URL
    const url = new URL(req.url);
    const applicationUuid = url.searchParams.get('application_id');

    if (!applicationUuid) {
      console.error("Missing application_id in request");
      return new Response(JSON.stringify({ error: 'Application ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing document for application ID: ${applicationUuid}`);

    // Check if content type is multipart/form-data
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      console.error(`Invalid content type: ${contentType}`);
      return new Response(JSON.stringify({ error: 'Content type must be multipart/form-data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const fileData = formData.get('file');

    if (!fileData || !(fileData instanceof File)) {
      console.error("No file uploaded in request");
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing file: ${fileData.name}, size: ${fileData.size} bytes, type: ${fileData.type}`);

    // Convert file to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Process document based on file type
    let extractedText = '';
    const isPdf = fileData.type === 'application/pdf';
    const isImage = /^image\/(jpeg|jpg|png|bmp|tiff)$/.test(fileData.type);

    if (isPdf) {
      extractedText = await extractTextFromPdf(arrayBuffer);
    } else if (isImage) {
      extractedText = await processImageWithGoogleVision(arrayBuffer);
    } else {
      console.error(`Unsupported file type: ${fileData.type}`);
      return new Response(JSON.stringify({ 
        error: 'Unsupported file type. Please upload a PDF or an image file (JPEG, PNG, BMP, TIFF).'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      console.error("No text extracted from document");
      return new Response(JSON.stringify({ 
        error: 'No text could be extracted from the document. Please try with a clearer image or PDF.'
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Successfully extracted ${extractedText.length} characters of text`);

    // Parse extracted text and prepare application data
    const extractedData = parseExtractedText(extractedText);
    console.log("Structured data extracted:", JSON.stringify(extractedData).substring(0, 200) + "...");

    // Store extracted data in Supabase
    console.log(`Updating application ${applicationUuid} with extracted data in database...`);
    const { error: dbError } = await supabaseClient
      .from('applications')
      .update({ jsonb_data: extractedData })
      .eq('application_id', applicationUuid);

    if (dbError) {
      console.error("Error updating application with OCR data:", dbError);
      return new Response(JSON.stringify({ 
        error: `Database error: ${dbError.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Structure the response data
    const responseData = {
      personalDetails: extractedData.personalDetails || {},
      employmentDetails: extractedData.employmentDetails || {},
      residentialDetails: extractedData.residentialDetails || {},
      financialDetails: extractedData.financialDetails || {}
    };

    console.log("OCR processing completed successfully");
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in process-document function:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
