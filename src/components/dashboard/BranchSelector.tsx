import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { canViewAllBranches } from '@/utils/roleBasedAccess';

interface Branch {
  id: string;
  branch_name: string;
  branch_code: string;
}

interface BranchSelectorProps {
  selectedBranchId?: string;
  onBranchChange: (branchId: string) => void;
}

export const BranchSelector = ({ selectedBranchId, onBranchChange }: BranchSelectorProps) => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, branch_name, branch_code')
          .eq('is_active', true)
          .order('branch_name');

        if (error) throw error;
        setBranches(data || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Don't show branch selector for users who can't view all branches
  if (!canViewAllBranches(user)) {
    return null;
  }

  if (loading) {
    return <div className="w-48 h-10 bg-gray-100 animate-pulse rounded"></div>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Branch:</span>
      <Select value={selectedBranchId || 'all'} onValueChange={onBranchChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Branches</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.branch_name} ({branch.branch_code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};