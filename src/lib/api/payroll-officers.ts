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
  id?: string;
  deduction_request_id?: string;
  loan_id: string;
  borrower_name: string;
  file_number?: string;
  loan_amount?: number;
  interest_amount?: number;
  principal_amount?: number;
  gross_loan_amount?: number;
  gross_amount?: number;
  default_amount?: number;
  current_outstanding?: number;
  fortnightly_installment?: number;
  pva_amount?: number; // PVA AMOUNT (same as fortnightly_installment)
  pay_period?: string;
  scheduled_repayment_amount?: number;
  missed_payment_date?: string;
  created_at?: string;
}

export const payrollOfficersApi = {
  async getPayrollOfficers() {
    try {
      const { data, error } = await (supabase as any)
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
      const { data, error } = await (supabase as any)
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
      const { data, error } = await (supabase as any)
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
      const { error } = await (supabase as any)
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
      const { data, error } = await (supabase as any)
        .from('deduction_requests')
        .select(`
          *,
          payroll_officer:payroll_officers(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the status field to ensure proper typing
      return (data || []).map((request: any) => ({
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
    current_pay_period?: string;
    next_pay_period?: string;
    next_pay_date?: string;
    organization_address?: string;
    total_active_clients?: number;
    cc_emails?: string[];
    include_isda_forms?: boolean;
    clients: DeductionRequestClient[];
    notes?: string;
  }) {
    try {
      const total_clients = request.clients.length;
      const total_amount = request.clients.reduce((sum, client) => 
        sum + (client.current_outstanding || 0), 0
      );

      // Create the deduction request
      const { data: deductionRequest, error: requestError } = await (supabase as any)
        .from('deduction_requests')
        .insert({
          payroll_officer_id: request.payroll_officer_id,
          organization_name: request.organization_name,
          pay_period: request.pay_period,
          current_pay_period: request.current_pay_period,
          next_pay_period: request.next_pay_period,
          next_pay_date: request.next_pay_date,
          organization_address: request.organization_address,
          total_active_clients: request.total_active_clients,
          cc_emails: request.cc_emails,
          include_isda_forms: request.include_isda_forms !== false,
          total_clients,
          total_amount,
          notes: request.notes,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Create the client records with all loan details
      const clientsWithRequestId = request.clients.map(client => ({
        deduction_request_id: deductionRequest.id,
        loan_id: client.loan_id,
        borrower_name: client.borrower_name,
        file_number: client.file_number,
        loan_amount: client.loan_amount,
        interest_amount: client.interest_amount,
        principal_amount: client.principal_amount,
        gross_loan_amount: client.gross_loan_amount,
        gross_amount: client.gross_amount,
        default_amount: client.default_amount,
        current_outstanding: client.current_outstanding,
        fortnightly_installment: client.fortnightly_installment,
        pva_amount: client.pva_amount,
        pay_period: client.pay_period,
        scheduled_repayment_amount: client.scheduled_repayment_amount,
        missed_payment_date: client.missed_payment_date,
      }));

      const { error: clientsError } = await (supabase as any)
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
      const { data, error } = await (supabase as any)
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

  async sendDeductionRequestEmail(requestId: string, microserviceEndpoint: string) {
    try {
      // Fetch deduction request with all related data
      const { data: request, error: requestError } = await supabase
        .from('deduction_requests')
        .select(`
          *,
          payroll_officer:payroll_officers(*),
          clients:deduction_request_clients(*)
        `)
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Prepare comprehensive payload for the FastAPI microservice
      const emailPayload = {
        request_id: requestId,
        payroll_officer: {
          officer_name: request.payroll_officer.officer_name,
          title: request.payroll_officer.title || 'Payroll Officer',
          email: request.payroll_officer.email
        },
        organization: {
          name: request.organization_name,
          address: request.organization_address || '',
          total_active_clients: request.total_active_clients || 0
        },
        pay_periods: {
          current: request.current_pay_period || request.pay_period,
          next: request.next_pay_period || '',
          next_date: request.next_pay_date || ''
        },
        clients: request.clients.map((client: any) => ({
          client_name: client.borrower_name,
          file_number: client.file_number || '',
          principal_amount: client.principal_amount || 0,
          interest_amount: client.interest_amount || 0,
          gross_loan: client.gross_loan_amount || 0,
          pva_amount: client.pva_amount || client.fortnightly_installment || 0,
          default_fee: client.default_amount || 0,
          current_balance: client.current_outstanding || 0
        })),
        cc_emails: request.cc_emails || [],
        include_isda_forms: request.include_isda_forms !== false,
        notes: request.notes || ''
      };

      // Call Python FastAPI microservice
      const response = await fetch(microserviceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Microservice error: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      // Update deduction request status
      await this.updateDeductionRequestStatus(requestId, 'sent');

      return result;
    } catch (error) {
      console.error('Error sending deduction request via microservice:', error);
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

      const { data, error } = await (supabase as any)
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