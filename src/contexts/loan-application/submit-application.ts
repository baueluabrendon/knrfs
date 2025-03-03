
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FormDataType } from "@/types/loan";

export async function submitApplication(formData: FormDataType): Promise<boolean> {
  try {
    // Submit application data to Supabase without requiring authentication
    const { error } = await supabase
      .from('applications')
      .insert({
        jsonb_data: formData as any,
        uploaded_at: new Date().toISOString(),
        status: 'pending'
      });

    if (error) {
      throw error;
    }

    toast.success("Application submitted successfully");
    return true;
  } catch (error) {
    console.error('Error submitting application:', error);
    toast.error("Failed to submit application. Please try again.");
    return false;
  }
}
