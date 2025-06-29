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
      accounting_transactions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          reference_number: string | null
          transaction_date: string
          transaction_id: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          reference_number?: string | null
          transaction_date: string
          transaction_id?: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          reference_number?: string | null
          transaction_date?: string
          transaction_id?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          application_document_url: string | null
          application_id: string
          jsonb_data: Json | null
          jsonb_loans: Json | null
          status: Database["public"]["Enums"]["application_status_enum"] | null
          updated_at: string | null
          uploaded_at: string | null
        }
        Insert: {
          application_document_url?: string | null
          application_id?: string
          jsonb_data?: Json | null
          jsonb_loans?: Json | null
          status?: Database["public"]["Enums"]["application_status_enum"] | null
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Update: {
          application_document_url?: string | null
          application_id?: string
          jsonb_data?: Json | null
          jsonb_loans?: Json | null
          status?: Database["public"]["Enums"]["application_status_enum"] | null
          updated_at?: string | null
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
      chart_of_accounts: {
        Row: {
          account_category: string
          account_id: string
          account_name: string
          account_type: string
          created_at: string | null
          description: string | null
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          account_category: string
          account_id: string
          account_name: string
          account_type: string
          created_at?: string | null
          description?: string | null
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          account_category?: string
          account_id?: string
          account_name?: string
          account_type?: string
          created_at?: string | null
          description?: string | null
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      defaults: {
        Row: {
          arrear_id: string
          created_at: string | null
          date: string | null
          default_amount: number | null
          reason_code: string | null
          schedule_id: string | null
          status: Database["public"]["Enums"]["default_status_enum"] | null
          updated_at: string | null
        }
        Insert: {
          arrear_id?: string
          created_at?: string | null
          date?: string | null
          default_amount?: number | null
          reason_code?: string | null
          schedule_id?: string | null
          status?: Database["public"]["Enums"]["default_status_enum"] | null
          updated_at?: string | null
        }
        Update: {
          arrear_id?: string
          created_at?: string | null
          date?: string | null
          default_amount?: number | null
          reason_code?: string | null
          schedule_id?: string | null
          status?: Database["public"]["Enums"]["default_status_enum"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defaults_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "repayment_schedule"
            referencedColumns: ["schedule_id"]
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
      financial_reports: {
        Row: {
          generated_at: string | null
          generated_by: string | null
          notes: string | null
          period_id: number | null
          report_data: Json | null
          report_id: string
          report_type: string
        }
        Insert: {
          generated_at?: string | null
          generated_by?: string | null
          notes?: string | null
          period_id?: number | null
          report_data?: Json | null
          report_id?: string
          report_type: string
        }
        Update: {
          generated_at?: string | null
          generated_by?: string | null
          notes?: string | null
          period_id?: number | null
          report_data?: Json | null
          report_id?: string
          report_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_reports_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "fiscal_periods"
            referencedColumns: ["period_id"]
          },
        ]
      }
      fiscal_periods: {
        Row: {
          created_at: string | null
          end_date: string
          is_closed: boolean | null
          period_id: number
          period_name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          is_closed?: boolean | null
          period_id?: number
          period_name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          is_closed?: boolean | null
          period_id?: number
          period_name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      loans: {
        Row: {
          arrears: number | null
          borrower_id: string
          created_at: string | null
          default_fees_accumulated: number | null
          disbursement_date: string
          documentation_fee: number | null
          documentation_fee_accumulated: number | null
          early_settlement: boolean | null
          fortnightly_installment: number
          gross_loan: number
          gross_salary: number
          gst_accumulated: number | null
          gst_amount: number | null
          interest: number
          interest_accumulated: number | null
          interest_rate:
            | Database["public"]["Enums"]["interest_rate_enum"]
            | null
          last_payment_date: string | null
          loan_id: string
          loan_repayment_status:
            | Database["public"]["Enums"]["repayment_status_enum"]
            | null
          loan_risk_insurance: number
          loan_risk_insurance_accumulated: number | null
          loan_status: Database["public"]["Enums"]["loan_status_enum"] | null
          loan_term:
            | Database["public"]["Enums"]["bi_weekly_loan_term_enum"]
            | null
          maturity_date: string | null
          missed_payments_count: number | null
          net_income: number
          next_due_date: string | null
          outstanding_balance: number | null
          partial_payments_count: number | null
          principal: number
          principal_accumulated: number | null
          product: string
          refinanced_by: string | null
          repayment_completion_percentage: number | null
          repayment_count: number | null
          settled_date: string | null
          start_repayment_date: string
          total_repayment: number | null
          updated_at: string | null
        }
        Insert: {
          arrears?: number | null
          borrower_id: string
          created_at?: string | null
          default_fees_accumulated?: number | null
          disbursement_date: string
          documentation_fee?: number | null
          documentation_fee_accumulated?: number | null
          early_settlement?: boolean | null
          fortnightly_installment: number
          gross_loan: number
          gross_salary: number
          gst_accumulated?: number | null
          gst_amount?: number | null
          interest: number
          interest_accumulated?: number | null
          interest_rate?:
            | Database["public"]["Enums"]["interest_rate_enum"]
            | null
          last_payment_date?: string | null
          loan_id: string
          loan_repayment_status?:
            | Database["public"]["Enums"]["repayment_status_enum"]
            | null
          loan_risk_insurance: number
          loan_risk_insurance_accumulated?: number | null
          loan_status?: Database["public"]["Enums"]["loan_status_enum"] | null
          loan_term?:
            | Database["public"]["Enums"]["bi_weekly_loan_term_enum"]
            | null
          maturity_date?: string | null
          missed_payments_count?: number | null
          net_income: number
          next_due_date?: string | null
          outstanding_balance?: number | null
          partial_payments_count?: number | null
          principal: number
          principal_accumulated?: number | null
          product: string
          refinanced_by?: string | null
          repayment_completion_percentage?: number | null
          repayment_count?: number | null
          settled_date?: string | null
          start_repayment_date: string
          total_repayment?: number | null
          updated_at?: string | null
        }
        Update: {
          arrears?: number | null
          borrower_id?: string
          created_at?: string | null
          default_fees_accumulated?: number | null
          disbursement_date?: string
          documentation_fee?: number | null
          documentation_fee_accumulated?: number | null
          early_settlement?: boolean | null
          fortnightly_installment?: number
          gross_loan?: number
          gross_salary?: number
          gst_accumulated?: number | null
          gst_amount?: number | null
          interest?: number
          interest_accumulated?: number | null
          interest_rate?:
            | Database["public"]["Enums"]["interest_rate_enum"]
            | null
          last_payment_date?: string | null
          loan_id?: string
          loan_repayment_status?:
            | Database["public"]["Enums"]["repayment_status_enum"]
            | null
          loan_risk_insurance?: number
          loan_risk_insurance_accumulated?: number | null
          loan_status?: Database["public"]["Enums"]["loan_status_enum"] | null
          loan_term?:
            | Database["public"]["Enums"]["bi_weekly_loan_term_enum"]
            | null
          maturity_date?: string | null
          missed_payments_count?: number | null
          net_income?: number
          next_due_date?: string | null
          outstanding_balance?: number | null
          partial_payments_count?: number | null
          principal?: number
          principal_accumulated?: number | null
          product?: string
          refinanced_by?: string | null
          repayment_completion_percentage?: number | null
          repayment_count?: number | null
          settled_date?: string | null
          start_repayment_date?: string
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
        ]
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
        Relationships: []
      }
      repayment_schedule: {
        Row: {
          balance: number | null
          created_at: string | null
          documentation_feers: number | null
          due_date: string | null
          gst_amountrs: number | null
          interestrs: number | null
          loan_id: string
          loan_risk_insurancers: number | null
          pay_period: string | null
          payment_number: number | null
          payroll_type: string | null
          principalrs: number | null
          received_documentation_fee: number | null
          received_gst_amount: number | null
          received_interest: number | null
          received_loan_risk_insurance: number | null
          received_principal: number | null
          repayment_received: number | null
          repaymentrs: number | null
          schedule_id: string
          settled_date: string | null
          statusrs:
            | Database["public"]["Enums"]["repayment_schedule_status_enum"]
            | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          documentation_feers?: number | null
          due_date?: string | null
          gst_amountrs?: number | null
          interestrs?: number | null
          loan_id: string
          loan_risk_insurancers?: number | null
          pay_period?: string | null
          payment_number?: number | null
          payroll_type?: string | null
          principalrs?: number | null
          received_documentation_fee?: number | null
          received_gst_amount?: number | null
          received_interest?: number | null
          received_loan_risk_insurance?: number | null
          received_principal?: number | null
          repayment_received?: number | null
          repaymentrs?: number | null
          schedule_id?: string
          settled_date?: string | null
          statusrs?:
            | Database["public"]["Enums"]["repayment_schedule_status_enum"]
            | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          documentation_feers?: number | null
          due_date?: string | null
          gst_amountrs?: number | null
          interestrs?: number | null
          loan_id?: string
          loan_risk_insurancers?: number | null
          pay_period?: string | null
          payment_number?: number | null
          payroll_type?: string | null
          principalrs?: number | null
          received_documentation_fee?: number | null
          received_gst_amount?: number | null
          received_interest?: number | null
          received_loan_risk_insurance?: number | null
          received_principal?: number | null
          repayment_received?: number | null
          repaymentrs?: number | null
          schedule_id?: string
          settled_date?: string | null
          statusrs?:
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
        ]
      }
      repayments: {
        Row: {
          amount: number
          created_at: string | null
          due_status_change_date: string | null
          is_defaulted: boolean | null
          loan_id: string | null
          notes: string | null
          payment_date: string | null
          receipt_url: string | null
          repayment_id: string
          source: Database["public"]["Enums"]["source_enum"] | null
          status: string | null
          user_id: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_status_change_date?: string | null
          is_defaulted?: boolean | null
          loan_id?: string | null
          notes?: string | null
          payment_date?: string | null
          receipt_url?: string | null
          repayment_id?: string
          source?: Database["public"]["Enums"]["source_enum"] | null
          status?: string | null
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_status_change_date?: string | null
          is_defaulted?: boolean | null
          loan_id?: string | null
          notes?: string | null
          payment_date?: string | null
          receipt_url?: string | null
          repayment_id?: string
          source?: Database["public"]["Enums"]["source_enum"] | null
          status?: string | null
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["loan_id"]
          },
          {
            foreignKeyName: "repayments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transaction_lines: {
        Row: {
          account_id: string
          created_at: string | null
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          line_id: string
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          line_id?: string
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          line_id?: string
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transaction_lines_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "accounting_transactions"
            referencedColumns: ["transaction_id"]
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
      dashboard_metrics_view: {
        Row: {
          active_borrowers_count: number | null
          active_loans_count: number | null
          at_risk_loans_count: number | null
          avg_loan_duration_days: number | null
          pending_applications_count: number | null
          total_outstanding_balance: number | null
          total_principal_amount: number | null
          total_repayments_amount: number | null
        }
        Relationships: []
      }
      loan_repayment_calendar_view: {
        Row: {
          payroll_type: string | null
          period_end: string | null
          period_start: string | null
          time_frame: string | null
          total_disbursed: number | null
          total_repaid: number | null
        }
        Relationships: []
      }
      repayment_ledger_view: {
        Row: {
          account_name: string | null
          account_number: string | null
          bank: string | null
          borrower_id: string | null
          borrower_name: string | null
          credit: number | null
          debit: number | null
          default_fees_accumulated: number | null
          department_company: string | null
          description: string | null
          disbursement_date: string | null
          documentation_fee: number | null
          email: string | null
          entry_date: string | null
          file_number: string | null
          fortnightly_installment: number | null
          gross_loan: number | null
          gst_amount: number | null
          interest: number | null
          interest_rate:
            | Database["public"]["Enums"]["interest_rate_enum"]
            | null
          loan_id: string | null
          loan_risk_insurance: number | null
          loan_status: string | null
          loan_term:
            | Database["public"]["Enums"]["bi_weekly_loan_term_enum"]
            | null
          maturity_date: string | null
          mobile_number: string | null
          outstanding_balance: number | null
          pay_period: string | null
          payment_number: number | null
          payroll_type: string | null
          position: string | null
          postal_address: string | null
          principal: number | null
          repayment_completion_percentage: number | null
          schedule_id: string | null
          start_repayment_date: string | null
          status: string | null
          total_repayment: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_account_id: {
        Args: { p_account_type: Database["public"]["Enums"]["accounts_enum"] }
        Returns: string
      }
      generate_arrear_id: {
        Args: { p_schedule_id: string }
        Returns: string
      }
      generate_balance_sheet: {
        Args: { p_period_id: number }
        Returns: Json
      }
      generate_cashflow: {
        Args: { p_period_id: number }
        Returns: Json
      }
      generate_profit_loss: {
        Args: { p_period_id: number }
        Returns: Json
      }
      generate_repayment_id: {
        Args: { p_loan_id: string }
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
      default_status_enum: "active" | "waived" | "cleared"
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
      loan_status_enum:
        | "active"
        | "settled"
        | "overdue"
        | "written_off"
        | "default"
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
      source_enum: "system" | "client"
      verification_status_enum: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      accounts_enum: ["Revenue", "Expense", "Asset", "Liability", "Equity"],
      application_status_enum: [
        "pending",
        "in_review",
        "approved",
        "declined",
        "cancelled",
        "additional_documents_required",
      ],
      bi_weekly_loan_term_enum: [
        "TERM_5",
        "TERM_6",
        "TERM_7",
        "TERM_8",
        "TERM_9",
        "TERM_10",
        "TERM_12",
        "TERM_14",
        "TERM_16",
        "TERM_18",
        "TERM_20",
        "TERM_22",
        "TERM_24",
        "TERM_26",
        "TERM_28",
        "TERM_30",
      ],
      default_status_enum: ["active", "waived", "cleared"],
      document_type_enum: [
        "Terms and Conditions",
        "Pay Slip 1",
        "Pay Slip 2",
        "Pay Slip 3",
        "3 Months Bank Statement",
        "ID Document",
        "Irrevocable Salary Deduction Authority",
        "Employment Confirmation Letter",
        "Data Entry Form",
        "Permanent Variation Advice",
        "Nasfund Account Statement",
        "Salary Deduction Confirmation Letter",
      ],
      interest_rate_enum: [
        "RATE_20",
        "RATE_22",
        "RATE_24",
        "RATE_26",
        "RATE_28",
        "RATE_30",
        "RATE_34",
        "RATE_38",
        "RATE_42",
        "RATE_46",
        "RATE_50",
        "RATE_54",
        "RATE_58",
        "RATE_62",
        "RATE_66",
        "RATE_70",
      ],
      loan_status_enum: [
        "active",
        "settled",
        "overdue",
        "written_off",
        "default",
      ],
      repayment_group_enum: [
        "itd finance",
        "nicta",
        "png power",
        "nfa",
        "water png",
        "westpac",
        "bsp",
        "kina bank",
        "others",
      ],
      repayment_schedule_status_enum: [
        "paid",
        "pending",
        "late",
        "default",
        "partial",
      ],
      repayment_status_enum: ["paid", "on time", "late", "default", "partial"],
      source_enum: ["system", "client"],
      verification_status_enum: ["pending", "approved", "rejected"],
    },
  },
} as const
