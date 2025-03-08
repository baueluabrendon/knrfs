
/**
 * Utility functions for calling Supabase Edge Functions
 */
import { toast } from "sonner";

interface ApplicationRecord {
  application_id: string;
  application_document_url: string;
  status: 'pending' | 'approved' | 'declined';
  jsonb_data?: any;
}

/**
 * Calls the process-approved-application edge function with the provided application data
 * @param record The application record to process
 * @returns The response from the edge function
 */
export const callProcessApplicationEdgeFunction = async (record: ApplicationRecord): Promise<any> => {
  try {
    console.log('Calling edge function to process application:', record.application_id);
    console.log('With document URL:', record.application_document_url);
    
    if (!record.application_document_url) {
      console.error('Missing application_document_url for application:', record.application_id);
      toast.error('Application document URL is missing. OCR processing cannot proceed.');
      throw new Error('Application document URL is missing');
    }
    
    const edgeFunctionUrl = 'https://mhndkefbyvxasvayigvx.supabase.co/functions/v1/process-approved-application';
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ record })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process application');
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Error calling process application edge function:', error);
    throw error;
  }
};
