export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      borrowers: {
        Row: {
          account_name: string | null
          account_number: string | null
          account_type: string | null
          bank: string | null
          bank_branch: string | null
          borrower_id: string
          bsb_code: string | null
          company_branch: string | null
          date_employed: string | null
          date_of_birth: string | null
          department_company: string | null
          district: string | null
          email: string
          fax: string | null
          file_number: string | null
          gender: string | null
          given_name: string
          loan_repayment_group: string | null
          lot: string | null
          marital_status: string | null
          mobile_number: string | null
          nationality: string | null
          paymaster: string | null
          position: string | null
          postal_address: string | null
          province: string | null
          section: string | null
          spouse_contact_details: string | null
          spouse_employer_name: string | null
          spouse_first_name: string | null
          spouse_last_name: string | null
          street_name: string | null
          suburb: string | null
          surname: string
          village: string | null
          work_phone_number: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          account_type?: string | null
          bank?: string | null
          bank_branch?: string | null
          borrower_id: string
          bsb_code?: string | null
          company_branch?: string | null
          date_employed?: string | null
          date_of_birth?: string | null
          department_company?: string | null
          district?: string | null
          email: string
          fax?: string | null
          file_number?: string | null
          gender?: string | null
          given_name: string
          loan_repayment_group?: string | null
          lot?: string | null
          marital_status?: string | null
          mobile_number?: string | null
          nationality?: string | null
          paymaster?: string | null
          position?: string | null
          postal_address?: string | null
          province?: string | null
          section?: string | null
          spouse_contact_details?: string | null
          spouse_employer_name?: string | null
          spouse_first_name?: string | null
          spouse_last_name?: string | null
          street_name?: string | null
          suburb?: string | null
          surname: string
          village?: string | null
          work_phone_number?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          account_type?: string | null
          bank?: string | null
          bank_branch?: string | null
          borrower_id?: string
          bsb_code?: string | null
          company_branch?: string | null
          date_employed?: string | null
          date_of_birth?: string | null
          department_company?: string | null
          district?: string | null
          email?: string
          fax?: string | null
          file_number?: string | null
          gender?: string | null
          given_name?: string
          loan_repayment_group?: string | null
          lot?: string | null
          marital_status?: string | null
          mobile_number?: string | null
          nationality?: string | null
          paymaster?: string | null
          position?: string | null
          postal_address?: string | null
          province?: string | null
          section?: string | null
          spouse_contact_details?: string | null
          spouse_employer_name?: string | null
          spouse_first_name?: string | null
          spouse_last_name?: string | null
          street_name?: string | null
          suburb?: string | null
          surname?: string
          village?: string | null
          work_phone_number?: string | null
        }
        Relationships: []
      }
      loans: {
        Row: {
          borrower_id: string
          created_at: string | null
          default_fees_accumulated: number | null
          description: string | null
          documentation_fee: number | null
          due_date: string | null
          fortnightly_installment: number
          gst_amount: number | null
          gst_rate: number | null
          interest_amount: number
          interest_rate: number
          last_status_update: string | null
          loan_amount: number
          loan_end_date: string | null
          loan_id: string
          loan_repayment_status: string | null
          loan_risk_insurance: number
          loan_start_date: string | null
          loan_status: string | null
          loan_term: number
          missed_payments_count: number | null
          partial_payment_penalty_fees_accumulated: number | null
          partial_payments_count: number | null
          payment_count: number | null
          principal_repayment: number | null
          repayment_completion_percentage: number | null
          total_loan_repayable: number
          total_payments_count: number | null
          updated_at: string | null
        }
        Insert: {
          borrower_id: string
          created_at?: string | null
          default_fees_accumulated?: number | null
          description?: string | null
          documentation_fee?: number | null
          due_date?: string | null
          fortnightly_installment: number
          gst_amount?: number | null
          gst_rate?: number | null
          interest_amount: number
          interest_rate: number
          last_status_update?: string | null
          loan_amount: number
          loan_end_date?: string | null
          loan_id: string
          loan_repayment_status?: string | null
          loan_risk_insurance: number
          loan_start_date?: string | null
          loan_status?: string | null
          loan_term: number
          missed_payments_count?: number | null
          partial_payment_penalty_fees_accumulated?: number | null
          partial_payments_count?: number | null
          payment_count?: number | null
          principal_repayment?: number | null
          repayment_completion_percentage?: number | null
          total_loan_repayable: number
          total_payments_count?: number | null
          updated_at?: string | null
        }
        Update: {
          borrower_id?: string
          created_at?: string | null
          default_fees_accumulated?: number | null
          description?: string | null
          documentation_fee?: number | null
          due_date?: string | null
          fortnightly_installment?: number
          gst_amount?: number | null
          gst_rate?: number | null
          interest_amount?: number
          interest_rate?: number
          last_status_update?: string | null
          loan_amount?: number
          loan_end_date?: string | null
          loan_id?: string
          loan_repayment_status?: string | null
          loan_risk_insurance?: number
          loan_start_date?: string | null
          loan_status?: string | null
          loan_term?: number
          missed_payments_count?: number | null
          partial_payment_penalty_fees_accumulated?: number | null
          partial_payments_count?: number | null
          payment_count?: number | null
          principal_repayment?: number | null
          repayment_completion_percentage?: number | null
          total_loan_repayable?: number
          total_payments_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_borrower"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "borrowers"
            referencedColumns: ["borrower_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          last_name: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          last_name?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_password: {
        Args: {
          username: string
          new_password: string
        }
        Returns: undefined
      }
    }
    Enums: {
      document_category:
        | "identification"
        | "income"
        | "employment"
        | "payroll"
        | "bank"
        | "primary"
        | "other"
      document_type:
        | "national id"
        | "passport"
        | "drivers license"
        | "payslip"
        | "employment letter"
        | "bank statement"
        | "data entry form"
        | "loan application form"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
