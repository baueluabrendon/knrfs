import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBranches = () => {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("id, branch_name, branch_code")
        .eq("is_active", true)
        .order("branch_name");

      if (error) throw error;
      return data || [];
    },
  });
};
