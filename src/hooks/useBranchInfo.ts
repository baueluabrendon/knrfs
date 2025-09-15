import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BranchInfo {
  id: string;
  branch_name: string;
  branch_code: string;
}

export const useBranchInfo = (branchId: string | null) => {
  const [branch, setBranch] = useState<BranchInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBranch = async () => {
      if (!branchId) {
        setBranch(null);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, branch_name, branch_code')
          .eq('id', branchId)
          .single();

        if (error) {
          console.error('Error fetching branch:', error);
          setBranch(null);
        } else {
          setBranch(data);
        }
      } catch (error) {
        console.error('Error fetching branch:', error);
        setBranch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, [branchId]);

  return { branch, loading };
};