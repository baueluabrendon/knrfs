import { supabase } from '@/integrations/supabase/client';

export interface PayrollOfficer {
  id: string;
  organization_name: string;
  officer_name: string;
  title?: string;
  email: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeductionRequest {
  id: string;
  payroll_officer_id: string;
  organization_name: string;
  request_date: string;
  pay_period?: string;
  total_clients: number;
  total_amount: number;
  status: 'pending' | 'sent' | 'acknowledged' | 'completed';
  email_sent_at?: string;
  email_sent_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  payroll_officer?: PayrollOfficer;
}

export interface DeductionRequestClient {
  id: string;
  deduction_request_id: string;
  loan_id: string;
  borrower_name: string;
  file_number?: string;
  loan_amount?: number;
  interest_amount?: number;
  gross_amount?: number;
  default_amount?: number;
  current_outstanding?: number;
  created_at: string;
}

export const payrollOfficersApi = {
  async getPayrollOfficers() {
    try {
      const { data, error } = await supabase
        .from('payroll_officers')
        .select('*')
        .eq('is_active', true)
        .order('organization_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payroll officers:', error);
      throw error;
    }
  },

  async createPayrollOfficer(officer: Omit<PayrollOfficer, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('payroll_officers')
        .insert(officer)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payroll officer:', error);
      throw error;
    }
  },

  async updatePayrollOfficer(id: string, updates: Partial<PayrollOfficer>) {
    try {
      const { data, error } = await supabase
        .from('payroll_officers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating payroll officer:', error);
      throw error;
    }
  },

  async deletePayrollOfficer(id: string) {
    try {
      const { error } = await supabase
        .from('payroll_officers')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting payroll officer:', error);
      throw error;
    }
  },

  async getDeductionRequests() {
    try {
      const { data, error } = await supabase
        .from('deduction_requests')
        .select(`
          *,
          payroll_officer:payroll_officers(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the status field to ensure proper typing
      return (data || []).map(request => ({
        ...request,
        status: request.status as DeductionRequest['status']
      }));
    } catch (error) {
      console.error('Error fetching deduction requests:', error);
      throw error;
    }
  },

  async createDeductionRequest(request: {
    payroll_officer_id: string;
    organization_name: string;
    pay_period?: string;
    clients: Array<{
      loan_id: string;
      borrower_name: string;
      file_number?: string;
      loan_amount?: number;
      interest_amount?: number;
      gross_amount?: number;
      default_amount?: number;
      current_outstanding?: number;
    }>;
    notes?: string;
  }) {
    try {
      const total_clients = request.clients.length;
      const total_amount = request.clients.reduce((sum, client) => 
        sum + (client.current_outstanding || 0), 0
      );

      // Create the deduction request
      const { data: deductionRequest, error: requestError } = await supabase
        .from('deduction_requests')
        .insert({
          payroll_officer_id: request.payroll_officer_id,
          organization_name: request.organization_name,
          pay_period: request.pay_period,
          total_clients,
          total_amount,
          notes: request.notes,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Create the client records
      const clientsWithRequestId = request.clients.map(client => ({
        ...client,
        deduction_request_id: deductionRequest.id,
      }));

      const { error: clientsError } = await supabase
        .from('deduction_request_clients')
        .insert(clientsWithRequestId);

      if (clientsError) throw clientsError;

      return deductionRequest;
    } catch (error) {
      console.error('Error creating deduction request:', error);
      throw error;
    }
  },

  async getDeductionRequestClients(requestId: string) {
    try {
      const { data, error } = await supabase
        .from('deduction_request_clients')
        .select('*')
        .eq('deduction_request_id', requestId)
        .order('borrower_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching deduction request clients:', error);
      throw error;
    }
  },

  async sendDeductionRequestEmail(requestId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('send-deduction-request', {
        body: { deduction_request_id: requestId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending deduction request email:', error);
      throw error;
    }
  },

  async updateDeductionRequestStatus(id: string, status: DeductionRequest['status'], notes?: string) {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'sent') {
        updates.email_sent_at = new Date().toISOString();
      }

      if (notes) {
        updates.notes = notes;
      }

      const { data, error } = await supabase
        .from('deduction_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating deduction request status:', error);
      throw error;
    }
  }
};