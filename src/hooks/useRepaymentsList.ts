
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Repayment } from "@/types/repayment";
import { toast } from "sonner";

export const useRepaymentsList = () => {
  const fetchRepayments = async (): Promise<Repayment[]> => {
    const { data, error } = await supabase
      .from("repayments")
      .select(`
        *,
        loans:loan_id (
          borrower_id,
          borrowers:borrower_id (
            given_name,
            surname
          )
        )
      `);

    if (error) {
      console.error("Error fetching repayments:", error);
      toast.error("Failed to fetch repayments");
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item) => {
      const borrower = item.loans?.borrowers;
      return {
        repayment_id: item.repayment_id || `temp-${Date.now()}`,
        payment_date: item.payment_date || 
          item.created_at?.split("T")[0] || 
          new Date().toISOString().split("T")[0],
        amount: Number(item.amount),
        loan_id: item.loan_id || "Unknown",
        borrowerName: borrower ? 
          `${borrower.given_name} ${borrower.surname}` : 
          "Unknown",
        status: item.status as any || "pending",
        receipt_url: item.receipt_url || undefined,
        notes: item.notes || undefined,
        source: item.source,
        verification_status: item.verification_status,
        verified_at: item.verified_at,
        verified_by: item.verified_by,
      };
    });
  };

  return useQuery({
    queryKey: ["repayments"],
    queryFn: fetchRepayments
  });
};
