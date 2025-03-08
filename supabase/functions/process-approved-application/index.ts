
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

    // Ensure we have a valid record with an approved status
    if (!record || record.status !== 'approved') {
      return new Response(
        JSON.stringify({ error: 'Invalid request or application not approved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Processing approved application:', record.application_id);
    
    // Check if the application has an OCR-processed document
    let applicationData = record.jsonb_data;
    
    if (!applicationData && record.application_document_url) {
      // If no OCR data exists but we have a document URL, process it with Google Vision
      console.log('No pre-processed OCR data found, processing document with Google Vision:', record.application_document_url);
      try {
        applicationData = await processApplicationFormWithVision(record.application_document_url);
        
        // Update the application with the OCR data
        const { error: updateError } = await supabase
          .from('applications')
          .update({
            jsonb_data: applicationData,
            updated_at: new Date().toISOString()
          })
          .eq('application_id', record.application_id);
          
        if (updateError) {
          console.error('Error updating application with OCR data:', updateError);
          throw updateError;
        }
        
        console.log('Successfully processed document with Google Vision and updated application');
      } catch (error) {
        console.error('Failed to process document with Google Vision:', error);
        // Continue with existing data or empty object if processing fails
        applicationData = applicationData || {};
      }
    } else if (!applicationData) {
      applicationData = {};
    }
    
    const personalDetails = applicationData.personalDetails || {};
    const employmentDetails = applicationData.employmentDetails || {};
    const residentialDetails = applicationData.residentialDetails || {};
    const financialDetails = applicationData.financialDetails || {};

    // Create borrower record
    const { data: borrowerData, error: borrowerError } = await supabase
      .from('borrowers')
      .insert({
        given_name: personalDetails.firstName || '',
        surname: personalDetails.lastName || '',
        date_of_birth: personalDetails.dateOfBirth || null,
        gender: personalDetails.gender || '',
        mobile_number: personalDetails.phone || '',
        email: personalDetails.email || '',
        village: residentialDetails.village || '',
        district: residentialDetails.district || '',
        province: residentialDetails.province || '',
        nationality: personalDetails.nationality || '',
        department_company: employmentDetails.employerName || '',
        file_number: employmentDetails.fileNumber || '',
        position: employmentDetails.position || '',
        postal_address: employmentDetails.postalAddress || '',
        work_phone_number: employmentDetails.workPhoneNumber || '',
        fax: employmentDetails.fax || '',
        paymaster: employmentDetails.paymaster || '',
        lot: residentialDetails.lot || '',
        section: residentialDetails.section || '',
        suburb: residentialDetails.suburb || '',
        street_name: residentialDetails.streetName || '',
        marital_status: personalDetails.maritalStatus || '',
        spouse_last_name: personalDetails.spouseLastName || '',
        spouse_first_name: personalDetails.spouseFirstName || '',
        spouse_employer_name: personalDetails.spouseEmployerName || '',
        spouse_contact_details: personalDetails.spouseContactDetails || '',
        bank: financialDetails.bank || '',
        bank_branch: financialDetails.bankBranch || '',
        bsb_code: financialDetails.bsbCode || '',
        account_name: financialDetails.accountName || '',
        account_number: financialDetails.accountNumber || '',
        account_type: financialDetails.accountType || '',
        date_employed: employmentDetails.employmentDate || null
      })
      .select()
      .single();

    if (borrowerError) {
      console.error('Error creating borrower:', borrowerError);
      throw borrowerError;
    }

    console.log('Borrower created successfully:', borrowerData.borrower_id);

    // Calculate loan dates
    const disbursementDate = new Date();
    let maturityDate = new Date(disbursementDate);
    
    // Parse loan term to determine maturity date
    const loanTerm = parseInt(financialDetails.loanTerm || '0', 10);
    if (loanTerm) {
      maturityDate.setMonth(maturityDate.getMonth() + loanTerm);
    }

    // Create loan record
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .insert({
        borrower_id: borrowerData.borrower_id,
        application_id: record.application_id,
        principal: parseFloat(financialDetails.loanAmount || '0'),
        interest_rate: financialDetails.interestRate || 'standard',
        loan_term: financialDetails.loanTerm || 'short_term',
        fortnightly_installment: parseFloat(financialDetails.fortnightlyInstallment || '0'),
        loan_risk_insurance: parseFloat(financialDetails.loanRiskInsurance || '0'),
        documentation_fee: parseFloat(financialDetails.documentationFee || '0'),
        gross_loan: parseFloat(financialDetails.grossLoan || '0'),
        interest: 0, // This would need to be calculated based on principal and interest rate
        disbursement_date: disbursementDate.toISOString(),
        maturity_date: maturityDate.toISOString(),
        product: financialDetails.loanPurpose || 'personal',
        description: `Loan approved from application ${record.application_id}`
      })
      .select()
      .single();

    if (loanError) {
      console.error('Error creating loan:', loanError);
      throw loanError;
    }

    console.log('Loan created successfully:', loanData.loan_id);

    // Update the application with the borrower_id and loan_id
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('application_id', record.application_id);

    if (updateError) {
      console.error('Error updating application:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Application processed successfully',
        borrower_id: borrowerData.borrower_id,
        loan_id: loanData.loan_id
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
