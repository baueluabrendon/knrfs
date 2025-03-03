
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    if (!record || record.status !== 'approved' || !record.jsonb_data) {
      return new Response(
        JSON.stringify({ error: 'Invalid request or application not approved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Processing approved application:', record.application_id);
    const applicationData = record.jsonb_data;
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
