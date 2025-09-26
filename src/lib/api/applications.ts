import { supabase } from '@/integrations/supabase/client';

export const applicationsApi = {
  async approveApplication(applicationId: string, borrowerData: any) {
    try {
      // Get application details including employer type
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('application_id', applicationId)
        .single();

      if (appError) throw appError;

      // Create borrower with client_type mapped from employer_type
      const borrowerWithClientType = {
        ...borrowerData,
        client_type: application.employer_type || 'unclassified'
      };

      const { data: borrower, error: borrowerError } = await supabase
        .from('borrowers')
        .insert(borrowerWithClientType)
        .select()
        .single();

      if (borrowerError) throw borrowerError;

      // Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('application_id', applicationId);

      if (updateError) throw updateError;

      return { success: true, borrower };
    } catch (error) {
      console.error('Error approving application:', error);
      return { success: false, error };
    }
  }
};