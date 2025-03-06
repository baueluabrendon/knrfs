
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FormDataType } from "@/types/loan";

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
    
    if (existingApp) {
      // Update existing application
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          jsonb_data: formData as any,
          uploaded_at: new Date().toISOString(),
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
          jsonb_data: formData as any,
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
