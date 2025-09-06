import { supabase } from "@/integrations/supabase/client";

export interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  branch_type: 'head_office' | 'branch_office' | 'service_center';
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  phone_number?: string;
  email?: string;
  manager_name?: string;
  manager_contact?: string;
  is_active: boolean;
  opening_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBranchData {
  branch_code: string;
  branch_name: string;
  branch_type: 'head_office' | 'branch_office' | 'service_center';
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  phone_number?: string;
  email?: string;
  manager_name?: string;
  manager_contact?: string;
  opening_date?: string;
}

export interface UpdateBranchData extends Partial<CreateBranchData> {
  is_active?: boolean;
}

// Get all branches
export const getBranches = async () => {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Branch[];
};

// Get active branches only
export const getActiveBranches = async () => {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true)
    .order('branch_name');

  if (error) throw error;
  return data as Branch[];
};

// Get branch by ID
export const getBranchById = async (id: string) => {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Branch;
};

// Create new branch
export const createBranch = async (branchData: CreateBranchData) => {
  const { data, error } = await supabase
    .from('branches')
    .insert(branchData)
    .select()
    .single();

  if (error) throw error;
  return data as Branch;
};

// Update branch
export const updateBranch = async (id: string, branchData: UpdateBranchData) => {
  const { data, error } = await supabase
    .from('branches')
    .update(branchData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Branch;
};

// Delete branch (soft delete - deactivate)
export const deactivateBranch = async (id: string) => {
  const { data, error } = await supabase
    .from('branches')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Branch;
};

// Activate branch
export const activateBranch = async (id: string) => {
  const { data, error } = await supabase
    .from('branches')
    .update({ is_active: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Branch;
};

// Check if branch code exists
export const checkBranchCodeExists = async (code: string, excludeId?: string) => {
  let query = supabase
    .from('branches')
    .select('id')
    .eq('branch_code', code);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data.length > 0;
};