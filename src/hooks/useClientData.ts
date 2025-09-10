import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useClientLoans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-loans', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return [];

      // First get the user's borrower_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('borrower_id')
        .eq('user_id', user.user_id)
        .single();

      if (profileError) throw profileError;
      if (!userProfile?.borrower_id) return [];

      // Then get loans with borrower info
      const { data: loans, error } = await supabase
        .from('loans')
        .select(`
          *,
          borrowers!inner(given_name, surname, email, mobile_number, department_company)
        `)
        .eq('borrower_id', userProfile.borrower_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return loans || [];
    },
    enabled: !!user?.user_id,
  });
};

export const useClientRepayments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-repayments', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return [];

      // First get the user's borrower_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('borrower_id')
        .eq('user_id', user.user_id)
        .single();

      if (profileError) throw profileError;
      if (!userProfile?.borrower_id) return [];

      // Get repayments through loans
      const { data: repayments, error } = await supabase
        .from('repayments')
        .select(`
          *,
          loans!inner(borrower_id, loan_id, principal)
        `)
        .eq('loans.borrower_id', userProfile.borrower_id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return repayments || [];
    },
    enabled: !!user?.user_id,
  });
};

export const useClientNextPayment = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-next-payment', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return null;

      // First get the user's borrower_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('borrower_id')
        .eq('user_id', user.user_id)
        .single();

      if (profileError) throw profileError;
      if (!userProfile?.borrower_id) return null;

      // Get next pending repayment
      const { data: nextPayment, error } = await supabase
        .from('repayment_schedule')
        .select(`
          due_date,
          repaymentrs,
          statusrs,
          loan_id,
          payment_number,
          loans!inner(borrower_id, loan_id)
        `)
        .eq('loans.borrower_id', userProfile.borrower_id)
        .eq('statusrs', 'pending')
        .order('due_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return nextPayment;
    },
    enabled: !!user?.user_id,
  });
};

export const useClientApplications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-applications', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return [];

      // Get applications by email (since applications might not have borrower_id yet)
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .eq('jsonb_data->>email', user.email)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return applications || [];
    },
    enabled: !!user?.user_id && !!user?.email,
  });
};