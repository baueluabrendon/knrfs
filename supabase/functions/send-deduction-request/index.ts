import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeductionRequestData {
  deduction_request_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deduction_request_id }: DeductionRequestData = await req.json();

    if (!deduction_request_id) {
      return new Response(
        JSON.stringify({ error: "Deduction request ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch deduction request details
    const { data: request, error: requestError } = await supabase
      .from('deduction_requests')
      .select(`
        *,
        payroll_officer:payroll_officers(*)
      `)
      .eq('id', deduction_request_id)
      .single();

    if (requestError || !request) {
      console.error("Error fetching deduction request:", requestError);
      return new Response(
        JSON.stringify({ error: "Deduction request not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Fetch client details
    const { data: clients, error: clientsError } = await supabase
      .from('deduction_request_clients')
      .select('*')
      .eq('deduction_request_id', deduction_request_id)
      .order('borrower_name');

    if (clientsError) {
      console.error("Error fetching clients:", clientsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch client details" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate email content
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    // Create client table rows
    const clientRows = clients?.map((client, index) => {
      const rowNumber = String(index + 1).padStart(2, '0');
      return `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${rowNumber}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${client.borrower_name}</td>
          <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${client.file_number || 'N/A'}</td>
          <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${(client.loan_amount || 0).toFixed(2)}</td>
          <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${(client.interest_amount || 0).toFixed(2)}</td>
          <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${(client.gross_amount || client.loan_amount || 0).toFixed(2)}</td>
          <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${(client.default_amount || 0).toFixed(2)}</td>
          <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${(client.current_outstanding || 0).toFixed(2)}</td>
        </tr>
      `;
    }).join('') || '';

    // Calculate totals
    const totalLoanAmount = clients?.reduce((sum, client) => sum + (client.loan_amount || 0), 0) || 0;
    const totalInterest = clients?.reduce((sum, client) => sum + (client.interest_amount || 0), 0) || 0;
    const totalGross = clients?.reduce((sum, client) => sum + (client.gross_amount || client.loan_amount || 0), 0) || 0;
    const totalDefault = clients?.reduce((sum, client) => sum + (client.default_amount || 0), 0) || 0;
    const totalOutstanding = clients?.reduce((sum, client) => sum + (client.current_outstanding || 0), 0) || 0;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background-color: #2d5a27; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
            <div>
              <h1 style="margin: 0; font-size: 24px;">K&R Financial Services</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">"Provides Your Financial Solution"</p>
            </div>
          </div>
          <div style="margin-top: 15px; font-size: 12px; opacity: 0.9;">
            <p style="margin: 2px 0;">PO Box 75 Vision City Post</p>
            <p style="margin: 2px 0;">Office Waigani, Port Moresby,</p>
            <p style="margin: 2px 0;">National Capital District</p>
            <div style="margin-top: 10px;">
              <span>📧 gm@knrfs.org</span>
              <span style="margin-left: 20px;">📞 70011843</span>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <div style="margin-bottom: 30px;">
            <p style="margin: 0 0 10px 0;"><strong>The Human Resource Manager</strong></p>
            <p style="margin: 0 0 10px 0;">${request.organization_name}</p>
            <p style="margin: 0 0 20px 0;"><strong>${currentDate}</strong></p>
            <p style="margin: 0 0 10px 0;"><strong>Attention: ${request.payroll_officer?.officer_name || 'Payroll Officer'}</strong></p>
          </div>

          <div style="margin-bottom: 30px;">
            <p style="margin: 0 0 15px 0; font-weight: bold; font-size: 16px;">
              SUBJECT: Default deduction from client with ${request.organization_name}
            </p>
            
            <p style="margin: 0 0 15px 0; line-height: 1.6;">
              K&R Financial Services is pleased to be providing lending services to staff of the ${request.organization_name}.
            </p>
            
            <p style="margin: 0 0 15px 0; line-height: 1.6;">
              So far, we have ${request.total_clients} clients loaning with us. While we are happy to be a lending service provider to the 
              organization, we have noted default payments in the repayment, a breach thereof to the loan agreement signed by the client.
            </p>
            
            <p style="margin: 0 0 20px 0; line-height: 1.6;">
              Refer table as shown:
            </p>
          </div>

          <!-- Client Table -->
          <div style="overflow-x: auto; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse; border: 2px solid #333; font-size: 12px;">
              <thead>
                <tr style="background-color: #2d5a27; color: white;">
                  <th style="padding: 10px; text-align: center; border: 1px solid #333;">No</th>
                  <th style="padding: 10px; text-align: left; border: 1px solid #333;">CLIENT NAME</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #333;">FILE #</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #333;">LOAN AMT (K)</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #333;">INTREST PAY(K)</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #333;">GROSS LOAN (K)</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #333;">DEFAULT AMT (K)</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #333;">CURRENT OUTSTANDING BALANCE (K)</th>
                </tr>
              </thead>
              <tbody>
                ${clientRows}
                <!-- Total Row -->
                <tr style="background-color: #f0f0f0; font-weight: bold; border-top: 2px solid #333;">
                  <td style="padding: 10px; text-align: center; border: 1px solid #333;" colspan="3">TOTAL</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #333;">${totalLoanAmount.toFixed(2)}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #333;">${totalInterest.toFixed(2)}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #333;">${totalGross.toFixed(2)}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #333;">${totalDefault.toFixed(2)}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #333;">${totalOutstanding.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Request Details -->
          <div style="margin-bottom: 30px;">
            <p style="margin: 0 0 15px 0; line-height: 1.6;">
              Attached for your reference is the <strong>Irrevocable Salary Deduction Authority (ISDA)</strong> forms for these clients. 
              We request for:
            </p>
            
            <ol style="margin: 0 0 15px 20px; line-height: 1.8;">
              ${clients?.map(client => `
                <li>Deductions of the default fees for <strong>${client.borrower_name} K${(client.default_amount || 0).toFixed(2)}</strong>; and the re-adjustments of the total repayable <strong>K${(client.current_outstanding || 0).toFixed(2)}</strong></li>
              `).join('') || ''}
            </ol>
            
            <p style="margin: 0 0 15px 0; line-height: 1.6;">
              Kindly commence deductions as per PVA amount for <strong>${request.pay_period || 'PP019'}</strong> on <strong>17th September 2025</strong>.
            </p>
            
            <p style="margin: 0 0 15px 0; line-height: 1.6;">
              For further clarification, contact the Office on d-landline <strong>74115466</strong> or d-mobile <strong>70011843</strong>.
            </p>
          </div>

          <!-- Closing -->
          <div style="margin-top: 40px;">
            <p style="margin: 0 0 15px 0;">Thank you in advance for your time.</p>
            
            <div style="margin-top: 40px;">
              <p style="margin: 0 0 5px 0; font-weight: bold;">Vanessa Bale</p>
              <p style="margin: 0; font-style: italic;">Operation Manager</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #2d5a27; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
          <p style="margin: 0; opacity: 0.9;">
            This is an automated email from K&R Financial Services. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "K&R Financial Services <onboarding@resend.dev>",
      to: [request.payroll_officer?.email || ""],
      subject: `Default deduction request from K&R Financial Services - ${request.organization_name}`,
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailResponse.error }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Deduction request email sent successfully",
        email_id: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-deduction-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);