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
          account_id: number
          account_name: string
          account_type: Database["public"]["Enums"]["accounts_enum"]
        }
        Insert: {
          account_id?: number
          account_name: string
          account_type: Database["public"]["Enums"]["accounts_enum"]
        }
        Update: {
          account_id?: number
          account_name?: string
          account_type?: Database["public"]["Enums"]["accounts_enum"]
        }
        Relationships: []
      }
      applications: {
        Row: {
          application_id: string
          jsonb_data: Json | null
          status: Database["public"]["Enums"]["application_status_enum"] | null
          updated_at: string | null
          uploaded_at: string
        }
        Insert: {
          application_id?: string
          jsonb_data?: Json | null
          status?: Database["public"]["Enums"]["application_status_enum"] | null
          updated_at?: string | null
          uploaded_at: string
        }
        Update: {
          application_id?: string
          jsonb_data?: Json | null
          status?: Database["public"]["Enums"]["application_status_enum"] | null
          updated_at?: string | null
          uploaded_at?: string
        }
        Relationships: []
      }
      arrear: {
        Row: {
          arrear_amount: number | null
          arrear_date: string | null
          arrear_id: number
          borrower_id: string
          created_at: string | null
          loan_id: string
          period_id: number
          schedule_id: number
          updated_at: string | null
        }
        Insert: {
          arrear_amount?: number | null
          arrear_date?: string | null
          arrear_id?: number
          borrower_id: string
          created_at?: string | null
          loan_id: string
          period_id: number
          schedule_id: number
          updated_at?: string | null
        }
        Update: {
          arrear_amount?: number | null
          arrear_date?: string | null
          arrear_id?: number
          borrower_id?: string
          created_at?: string | null
          loan_id?: string
          period_id?: number
          schedule_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arrear_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "borrowers"
            referencedColumns: ["borrower_id"]
          },
          {
            foreignKeyName: "arrear_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["loan_id"]
          },
          {
            foreignKeyName: "arrear_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "pay_period"
            referencedColumns: ["period_id"]
          },
          {
            foreignKeyName: "arrear_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "repayment_schedule"
            referencedColumns: ["schedule_id"]
          },
        ]
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
          account_id: number
          amount: number
          created_at: string | null
          description: string | null
          entry_id: number
          ref_number: string
          transaction_date: string
        }
        Insert: {
          account_id: number
          amount: number
          created_at?: string | null
          description?: string | null
          entry_id?: number
          ref_number: string
          transaction_date: string
        }
        Update: {
          account_id?: number
          amount?: number
          created_at?: string | null
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
          borrower_id: string
          created_at: string | null
          default_fees_accumulated: number | null
          description: string | null
          disbursement_date: string | null
          documentation_fee: number | null
          due_date: string | null
          fortnightly_installment: number
          gross_loan: number
          gst_amount: number | null
          gst_rate: number | null
          interest: number
          interest_rate: number
          loan_id: string
          loan_repayment_status:
            | Database["public"]["Enums"]["repayment_status_enum"]
            | null
          loan_risk_insurance: number
          loan_status: Database["public"]["Enums"]["loan_status_enum"] | null
          loan_term: number
          maturity_date: string | null
          missed_payments_count: number | null
          partial_payment_penalty_fees_accumulated: number | null
          partial_payments_count: number | null
          principal: number
          product: string | null
          repayment_completion_percentage: number | null
          repayment_count: number | null
          total_repayment: number | null
          total_repayment_count: number | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          borrower_id: string
          created_at?: string | null
          default_fees_accumulated?: number | null
          description?: string | null
          disbursement_date?: string | null
          documentation_fee?: number | null
          due_date?: string | null
          fortnightly_installment: number
          gross_loan: number
          gst_amount?: number | null
          gst_rate?: number | null
          interest: number
          interest_rate: number
          loan_id: string
          loan_repayment_status?:
            | Database["public"]["Enums"]["repayment_status_enum"]
            | null
          loan_risk_insurance: number
          loan_status?: Database["public"]["Enums"]["loan_status_enum"] | null
          loan_term: number
          maturity_date?: string | null
          missed_payments_count?: number | null
          partial_payment_penalty_fees_accumulated?: number | null
          partial_payments_count?: number | null
          principal: number
          product?: string | null
          repayment_completion_percentage?: number | null
          repayment_count?: number | null
          total_repayment?: number | null
          total_repayment_count?: number | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          borrower_id?: string
          created_at?: string | null
          default_fees_accumulated?: number | null
          description?: string | null
          disbursement_date?: string | null
          documentation_fee?: number | null
          due_date?: string | null
          fortnightly_installment?: number
          gross_loan?: number
          gst_amount?: number | null
          gst_rate?: number | null
          interest?: number
          interest_rate?: number
          loan_id?: string
          loan_repayment_status?:
            | Database["public"]["Enums"]["repayment_status_enum"]
            | null
          loan_risk_insurance?: number
          loan_status?: Database["public"]["Enums"]["loan_status_enum"] | null
          loan_term?: number
          maturity_date?: string | null
          missed_payments_count?: number | null
          partial_payment_penalty_fees_accumulated?: number | null
          partial_payments_count?: number | null
          principal?: number
          product?: string | null
          repayment_completion_percentage?: number | null
          repayment_count?: number | null
          total_repayment?: number | null
          total_repayment_count?: number | null
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
      repayment_document: {
        Row: {
          borrower_id: string
          document_id: number
          document_path: string | null
          document_type: string | null
          loan_id: string
          uploaded_at: string | null
        }
        Insert: {
          borrower_id: string
          document_id?: number
          document_path?: string | null
          document_type?: string | null
          loan_id: string
          uploaded_at?: string | null
        }
        Update: {
          borrower_id?: string
          document_id?: number
          document_path?: string | null
          document_type?: string | null
          loan_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repayment_document_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "borrowers"
            referencedColumns: ["borrower_id"]
          },
          {
            foreignKeyName: "repayment_document_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["loan_id"]
          },
        ]
      }
      repayment_schedule: {
        Row: {
          borrower_id: string
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
          repayment_id: string
          schedule_id: number
          status:
            | Database["public"]["Enums"]["repayment_schedule_status_enum"]
            | null
          updated_at: string | null
        }
        Insert: {
          borrower_id: string
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
          repayment_id: string
          schedule_id?: number
          status?:
            | Database["public"]["Enums"]["repayment_schedule_status_enum"]
            | null
          updated_at?: string | null
        }
        Update: {
          borrower_id?: string
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
          repayment_id?: string
          schedule_id?: number
          status?:
            | Database["public"]["Enums"]["repayment_schedule_status_enum"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repayment_schedule_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "borrowers"
            referencedColumns: ["borrower_id"]
          },
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
          {
            foreignKeyName: "repayment_schedule_repayment_id_fkey"
            columns: ["repayment_id"]
            isOneToOne: false
            referencedRelation: "repayments"
            referencedColumns: ["repayment_id"]
          },
        ]
      }
      repayments: {
        Row: {
          amount: number
          borrower_id: string | null
          created_at: string | null
          loan_id: string | null
          payment_date: string | null
          payment_method: string | null
          repayment_id: string
          status: string | null
        }
        Insert: {
          amount: number
          borrower_id?: string | null
          created_at?: string | null
          loan_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          repayment_id?: string
          status?: string | null
        }
        Update: {
          amount?: number
          borrower_id?: string | null
          created_at?: string | null
          loan_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          repayment_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_repayments_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "borrowers"
            referencedColumns: ["borrower_id"]
          },
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
      [_ in never]: never
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
