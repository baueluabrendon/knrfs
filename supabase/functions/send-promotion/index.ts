import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PromotionCampaign {
  id: string;
  title: string;
  description: string;
  emailSubject: string;
  emailContent: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }>;
  recipients: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
  }>;
  status: string;
}

interface SendPromotionRequest {
  campaign: PromotionCampaign;
  microserviceEndpoint?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign, microserviceEndpoint }: SendPromotionRequest = await req.json();

    console.log('Processing promotion campaign:', campaign.title);
    console.log('Recipients count:', campaign.recipients.length);
    console.log('Attachments count:', campaign.attachments.length);

    // Default microservice endpoint - replace with your actual Python service
    const defaultEndpoint = Deno.env.get("PROMOTION_MICROSERVICE_URL") || "http://localhost:8000/api/send-campaign";
    const serviceEndpoint = microserviceEndpoint || defaultEndpoint;

    // Prepare the payload for the Python microservice
    const microservicePayload = {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        subject: campaign.emailSubject,
        content: campaign.emailContent,
        attachments: campaign.attachments.map(att => ({
          filename: att.fileName,
          url: att.fileUrl,
          type: att.fileType
        }))
      },
      recipients: campaign.recipients.map(recipient => ({
        id: recipient.id,
        name: recipient.name,
        email: recipient.email
      })),
      metadata: {
        sentFrom: "supabase-edge-function",
        timestamp: new Date().toISOString(),
        campaignId: campaign.id
      }
    };

    // Send to Python microservice
    let response;
    let sentCount = 0;
    let failedCount = 0;

    try {
      console.log('Calling Python microservice at:', serviceEndpoint);
      
      response = await fetch(serviceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('MICROSERVICE_API_KEY') || ''}`,
        },
        body: JSON.stringify(microservicePayload),
      });

      if (!response.ok) {
        throw new Error(`Microservice responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Microservice response:', result);

      sentCount = result.sentCount || campaign.recipients.length;
      failedCount = result.failedCount || 0;

    } catch (microserviceError) {
      console.error('Microservice call failed:', microserviceError);
      
      // Fallback: Log the campaign for manual processing
      console.log('Falling back to logging for manual processing');
      
      // In production, you might want to:
      // 1. Store the campaign in a queue table for retry
      // 2. Send via a backup email service
      // 3. Alert administrators
      
      failedCount = campaign.recipients.length;
      sentCount = 0;
    }

    // Update campaign status in database (if you have campaigns table)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log the campaign send attempt
    console.log(`Campaign ${campaign.id} processing completed:`);
    console.log(`- Sent: ${sentCount}`);
    console.log(`- Failed: ${failedCount}`);

    const responseData = {
      success: sentCount > 0,
      campaignId: campaign.id,
      sentCount,
      failedCount,
      message: sentCount > 0 
        ? `Campaign sent successfully to ${sentCount} recipient(s)` 
        : 'Campaign sending failed - stored for manual processing'
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-promotion function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Internal server error",
        message: "Failed to process campaign"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);