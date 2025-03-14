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
      accounts: {
        Row: {
          account_id: string
          account_name: string
          account_type: Database["public"]["Enums"]["accounts_enum"]
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          account_name: string
          account_type: Database["public"]["Enums"]["accounts_enum"]
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          account_name?: string
          account_type?: Database["public"]["Enums"]["accounts_enum"]
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          application_document_url: string | null
          application_id: string
          jsonb_data: Json | null
          status: Database["public"]["Enums"]["application_status_enum"] | null
          uploaded_at: string | null
        }
        Insert: {
          application_document_url?: string | null
          application_id?: string
          jsonb_data?: Json | null
          status?: Database["public"]["Enums"]["application_status_enum"] | null
          uploaded_at?: string | null
        }
        Update: {
          application_document_url?: string | null
          application_id?: string
          jsonb_data?: Json | null
          status?: Database["public"]["Enums"]["application_status_enum"] | null
          uploaded_at?: string | null
        }
        Relationships: []
      }
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
          borrower_id?: string
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
      defaults: {
        Row: {
          arrear_id: number
          created_at: string | null
          date: string | null
          default_amount: number | null
          loan_id: string
          updated_at: string | null
        }
        Insert: {
          arrear_id?: number
          created_at?: string | null
          date?: string | null
          default_amount?: number | null
          loan_id: string
          updated_at?: string | null
        }
        Update: {
          arrear_id?: number
          created_at?: string | null
          date?: string | null
          default_amount?: number | null
          loan_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arrear_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["loan_id"]
          },
        ]
      }
      documents: {
        Row: {
          application_uuid: string
          document_id: number
          document_path: string
          document_type: Database["public"]["Enums"]["document_type_enum"]
          uploaded_at: string | null
        }
        Insert: {
          application_uuid: string
          document_id?: number
          document_path: string
          document_type: Database["public"]["Enums"]["document_type_enum"]
          uploaded_at?: string | null
        }
        Update: {
          application_uuid?: string
          document_id?: number
          document_path?: string
          document_type?: Database["public"]["Enums"]["document_type_enum"]
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_application_uuid_fkey"
            columns: ["application_uuid"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["application_id"]
          },
        ]
      }
      journal_entry: {
        Row: {
          account_id: string
          created_at: string | null
          credit: number | null
          debit: number | null
          description: string | null
          entry_id: number
          ref_number: string
          transaction_date: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          description?: string | null
          entry_id?: number
          ref_number: string
          transaction_date: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          description?: string | null
          entry_id?: number
          ref_number?: string
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_id"]
          },
        ]
      }
      loans: {
        Row: {
          application_id: string | null
          arrears: number | null
          borrower_id: string
          created_at: string | null
          default_fees_accumulated: number | null
          disbursement_date: string | null
          documentation_fee: number | null
          fortnightly_installment: number
          gross_loan: number
          gross_salary: number | null
          gst_amount: number | null
          interest: number
          interest_rate:
            | Database["public"]["Enums"]["interest_rate_enum"]
            | null
          loan_id: string
          loan_repayment_status:
            | Database["public"]["Enums"]["repayment_status_enum"]
            | null
          loan_risk_insurance: number
          loan_status: Database["public"]["Enums"]["loan_status_enum"] | null
          loan_term:
            | Database["public"]["Enums"]["bi_weekly_loan_term_enum"]
            | null
          maturity_date: string | null
          missed_payments_count: number | null
          net_income: number | null
          net_repayable: number | null
          outstanding_balance: number | null
          partial_payments_count: number | null
          principal: number
          product: string | null
          refinanced_by: string | null
          repayment_completion_percentage: number | null
          repayment_count: number | null
          start_repayment_date: string | null
          total_repayment: number | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          arrears?: number | null
          borrower_id?: string
          created_at?: string | null
          default_fees_accumulated?: number | null
          disbursement_date?: string | null
          documentation_fee?: number | null
          fortnightly_installment: number
          gross_loan: number
          gross_salary?: number | null
          gst_amount?: number | null
          interest?: number
          interest_rate?:
            | Database["public"]["Enums"]["interest_rate_enum"]
            | null
          loan_id?: string
          loan_repayment_status?:
            | Database["public"]["Enums"]["repayment_status_enum"]
            | null
          loan_risk_insurance?: number
          loan_status?: Database["public"]["Enums"]["loan_status_enum"] | null
          loan_term?:
            | Database["public"]["Enums"]["bi_weekly_loan_term_enum"]
            | null
          maturity_date?: string | null
          missed_payments_count?: number | null
          net_income?: number | null
          net_repayable?: number | null
          outstanding_balance?: number | null
          partial_payments_count?: number | null
          principal: number
          product?: string | null
          refinanced_by?: string | null
          repayment_completion_percentage?: number | null
          repayment_count?: number | null
          start_repayment_date?: string | null
          total_repayment?: number | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          arrears?: number | null
          borrower_id?: string
          created_at?: string | null
          default_fees_accumulated?: number | null
          disbursement_date?: string | null
          documentation_fee?: number | null
          fortnightly_installment?: number
          gross_loan?: number
          gross_salary?: number | null
          gst_amount?: number | null
          interest?: number
          interest_rate?:
            | Database["public"]["Enums"]["interest_rate_enum"]
            | null
          loan_id?: string
          loan_repayment_status?:
            | Database["public"]["Enums"]["repayment_status_enum"]
            | null
          loan_risk_insurance?: number
          loan_status?: Database["public"]["Enums"]["loan_status_enum"] | null
          loan_term?:
            | Database["public"]["Enums"]["bi_weekly_loan_term_enum"]
            | null
          maturity_date?: string | null
          missed_payments_count?: number | null
          net_income?: number | null
          net_repayable?: number | null
          outstanding_balance?: number | null
          partial_payments_count?: number | null
          principal?: number
          product?: string | null
          refinanced_by?: string | null
          repayment_completion_percentage?: number | null
          repayment_count?: number | null
          start_repayment_date?: string | null
          total_repayment?: number | null
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
          {
            foreignKeyName: "loans_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["application_id"]
          },
        ]
      }
      pay_period: {
        Row: {
          end_date: string
          pay_period: number
          pay_period_type: string
          period_id: number
          start_date: string
          year: number
        }
        Insert: {
          end_date: string
          pay_period: number
          pay_period_type: string
          period_id?: number
          start_date: string
          year: number
        }
        Update: {
          end_date?: string
          pay_period?: number
          pay_period_type?: string
          period_id?: number
          start_date?: string
          year?: number
        }
        Relationships: []
      }
      repayment_document_group: {
        Row: {
          created_at: string | null
          description: string | null
          document_url: string | null
          group_name: string
          id: number
          period_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_url?: string | null
          group_name: string
          id?: number
          period_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_url?: string | null
          group_name?: string
          id?: number
          period_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repayment_document_group_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "pay_period"
            referencedColumns: ["period_id"]
          },
        ]
      }
      repayment_schedule: {
        Row: {
          created_at: string | null
          default_fee: number
          documentation_fee: number
          gst_amount: number
          interest: number
          loan_id: string
          loan_risk_insurance: number
          partial_payment_penalty_fee: number
          payment_date: string
          payment_number: number
          period_id: number
          principal: number
          repayment: number
          schedule_id: number
          status:
            | Database["public"]["Enums"]["repayment_schedule_status_enum"]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_fee: number
          documentation_fee: number
          gst_amount: number
          interest: number
          loan_id: string
          loan_risk_insurance: number
          partial_payment_penalty_fee: number
          payment_date: string
          payment_number: number
          period_id: number
          principal: number
          repayment: number
          schedule_id?: number
          status?:
            | Database["public"]["Enums"]["repayment_schedule_status_enum"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_fee?: number
          documentation_fee?: number
          gst_amount?: number
          interest?: number
          loan_id?: string
          loan_risk_insurance?: number
          partial_payment_penalty_fee?: number
          payment_date?: string
          payment_number?: number
          period_id?: number
          principal?: number
          repayment?: number
          schedule_id?: number
          status?:
            | Database["public"]["Enums"]["repayment_schedule_status_enum"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repayment_schedule_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["loan_id"]
          },
          {
            foreignKeyName: "repayment_schedule_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "pay_period"
            referencedColumns: ["period_id"]
          },
        ]
      }
      repayments: {
        Row: {
          amount: number
          created_at: string | null
          loan_id: string | null
          payment_date: string | null
          receipt_url: string | null
          repayment_id: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          loan_id?: string | null
          payment_date?: string | null
          receipt_url?: string | null
          repayment_id?: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          loan_id?: string | null
          payment_date?: string | null
          receipt_url?: string | null
          repayment_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["loan_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          borrower_id: string | null
          created_at: string | null
          email: string
          first_name: string
          is_password_changed: boolean | null
          last_name: string
          role: string
          user_id: string
        }
        Insert: {
          borrower_id?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          is_password_changed?: boolean | null
          last_name?: string
          role?: string
          user_id: string
        }
        Update: {
          borrower_id?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          is_password_changed?: boolean | null
          last_name?: string
          role?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_account_id: {
        Args: {
          p_account_type: Database["public"]["Enums"]["accounts_enum"]
        }
        Returns: string
      }
    }
    Enums: {
      accounts_enum: "Revenue" | "Expense" | "Asset" | "Liability" | "Equity"
      application_status_enum:
        | "pending"
        | "in_review"
        | "approved"
        | "declined"
        | "cancelled"
        | "additional_documents_required"
      bi_weekly_loan_term_enum:
        | "TERM_5"
        | "TERM_6"
        | "TERM_7"
        | "TERM_8"
        | "TERM_9"
        | "TERM_10"
        | "TERM_12"
        | "TERM_14"
        | "TERM_16"
        | "TERM_18"
        | "TERM_20"
        | "TERM_22"
        | "TERM_24"
        | "TERM_26"
        | "TERM_28"
        | "TERM_30"
      document_type_enum:
        | "Terms and Conditions"
        | "Pay Slip 1"
        | "Pay Slip 2"
        | "Pay Slip 3"
        | "3 Months Bank Statement"
        | "ID Document"
        | "Irrevocable Salary Deduction Authority"
        | "Employment Confirmation Letter"
        | "Data Entry Form"
        | "Permanent Variation Advice"
        | "Nasfund Account Statement"
        | "Salary Deduction Confirmation Letter"
      interest_rate_enum:
        | "RATE_20"
        | "RATE_22"
        | "RATE_24"
        | "RATE_26"
        | "RATE_28"
        | "RATE_30"
        | "RATE_34"
        | "RATE_38"
        | "RATE_42"
        | "RATE_46"
        | "RATE_50"
        | "RATE_54"
        | "RATE_58"
        | "RATE_62"
        | "RATE_66"
        | "RATE_70"
      loan_status_enum: "active" | "settled" | "overdue" | "written_off"
      repayment_group_enum:
        | "itd finance"
        | "nicta"
        | "png power"
        | "nfa"
        | "water png"
        | "westpac"
        | "bsp"
        | "kina bank"
        | "others"
      repayment_schedule_status_enum:
        | "paid"
        | "pending"
        | "late"
        | "default"
        | "partial"
      repayment_status_enum: "paid" | "on time" | "late" | "default" | "partial"
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
