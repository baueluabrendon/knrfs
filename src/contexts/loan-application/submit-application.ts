
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FormDataType } from "@/types/loan";

/**
 * Submits the reviewed application form data to the database
 * This function is called after the user has reviewed the prefilled form
 * and made any necessary corrections in stage 3
 * 
 * @param formData The final form data after review
 * @param applicationUuid The UUID of the application being processed
 * @returns A boolean indicating success or failure
 */
export async function submitApplication(formData: FormDataType, applicationUuid: string): Promise<boolean> {
  try {
    // Check if application already exists
    const { data: existingApp, error: fetchError } = await supabase
      .from('applications')
      .select('application_id')
      .eq('application_id', applicationUuid)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking existing application:', fetchError);
      throw fetchError;
    }
    
    // Log the form data being submitted
    console.log('Submitting reviewed application data:', formData);
    
    if (existingApp) {
      // Update existing application with the reviewed form data
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          jsonb_data: formData as any,  // Save the reviewed form data
          updated_at: new Date().toISOString(),
          status: 'pending'
        })
        .eq('application_id', applicationUuid);
      
      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new application
      const { error: insertError } = await supabase
        .from('applications')
        .insert({
          application_id: applicationUuid,
          jsonb_data: formData as any,  // Save the reviewed form data
          uploaded_at: new Date().toISOString(),
          status: 'pending'
        });
      
      if (insertError) {
        throw insertError;
      }
    }

    toast.success("Application submitted successfully");
    return true;
  } catch (error) {
    console.error('Error submitting application:', error);
    toast.error("Failed to submit application. Please try again.");
    return false;
  }
}
