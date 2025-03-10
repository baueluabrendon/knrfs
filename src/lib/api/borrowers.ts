
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:5000';

export const borrowersApi = {
  async getBorrowers() {
    try {
      const { data, error } = await supabase
        .from('borrowers')
        .select('*')
        .order('surname', { ascending: true });
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch borrowers');
      }
      
      return data;
    } catch (error) {
      console.error('Get borrowers error:', error);
      throw error;
    }
  },

  async createBorrower(borrowerData: any) {
    try {
      const { data, error } = await supabase
        .from('borrowers')
        .insert(borrowerData)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to create borrower');
      }
      
      return data;
    } catch (error) {
      console.error('Create borrower error:', error);
      throw error;
    }
  },

  async uploadBulkBorrowers(borrowersData: any[]) {
    try {
      const { data, error } = await supabase
        .from('borrowers')
        .insert(borrowersData)
        .select();
      
      if (error) {
        throw new Error(error.message || 'Failed to upload borrowers');
      }
      
      return data;
    } catch (error) {
      console.error('Bulk upload borrowers error:', error);
      throw error;
    }
  }
};
