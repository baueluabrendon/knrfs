
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Borrower {
  given_name: string;
  surname: string;
  email: string;
}

interface Loan {
  loan_id: string;
  borrower_id: string;
  principal: number;
  interest: number;
  interest_rate?: string;
  loan_term?: string;
  gross_loan: number;
  fortnightly_installment: number;
  disbursement_date?: string;
  maturity_date?: string;
  start_repayment_date?: string;
  loan_repayment_status?: string;
  total_repayment?: number;
  outstanding_balance?: number;
  repayment_completion_percentage?: number;
  arrears?: number;
  default_fees_accumulated?: number;
  missed_payments_count?: number;
  partial_payments_count?: number;
  loan_status?: string;
  refinanced_by?: string;
  application_id?: string;
  loan_risk_insurance: number;
  documentation_fee: number;
  borrower?: Borrower;
}

export const useLoansList = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLoans();
    
    const channel = supabase
      .channel('public:loans')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'loans' 
      }, () => {
        fetchLoans();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLoans(loans);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = loans.filter(loan => 
        loan.loan_id.toLowerCase().includes(query) || 
        (loan.borrower && 
          `${loan.borrower.given_name} ${loan.borrower.surname}`.toLowerCase().includes(query))
      );
      setFilteredLoans(filtered);
    }
  }, [searchQuery, loans]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          borrower:borrower_id (
            given_name,
            surname,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
      setFilteredLoans(data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  return {
    loans,
    filteredLoans,
    loading,
    searchQuery,
    setSearchQuery,
    fetchLoans
  };
};
