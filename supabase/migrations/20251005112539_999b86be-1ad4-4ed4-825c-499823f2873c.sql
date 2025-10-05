-- Phase 1: Database Schema Enhancements for Deduction Request System

-- A. Create Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT UNIQUE NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  total_active_clients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Staff can manage organizations
CREATE POLICY "Staff can manage organizations"
ON organizations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role IN ('administrator', 'super user', 'recoveries officer')
  )
);

-- B. Link payroll_officers to organizations
ALTER TABLE payroll_officers
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_payroll_officers_org_id ON payroll_officers(organization_id);

-- C. Enhance deduction_requests table
ALTER TABLE deduction_requests
ADD COLUMN IF NOT EXISTS cc_emails TEXT[],
ADD COLUMN IF NOT EXISTS next_pay_period TEXT,
ADD COLUMN IF NOT EXISTS next_pay_date DATE,
ADD COLUMN IF NOT EXISTS current_pay_period TEXT,
ADD COLUMN IF NOT EXISTS include_isda_forms BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS organization_address TEXT,
ADD COLUMN IF NOT EXISTS total_active_clients INTEGER DEFAULT 0;

-- D. Enhance deduction_request_clients table
ALTER TABLE deduction_request_clients
ADD COLUMN IF NOT EXISTS principal_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS interest_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS gross_loan_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS pva_amount NUMERIC(10,2);

-- Make fortnightly_installment nullable for compatibility
ALTER TABLE deduction_request_clients
ALTER COLUMN fortnightly_installment DROP NOT NULL;

-- E. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_repayment_schedule_status_period 
ON repayment_schedule(statusrs, pay_period) 
WHERE statusrs IN ('default', 'partial');

CREATE INDEX IF NOT EXISTS idx_loans_borrower_status 
ON loans(borrower_id, loan_status) 
WHERE loan_status = 'active';

CREATE INDEX IF NOT EXISTS idx_borrowers_dept_company 
ON borrowers(department_company) 
WHERE department_company IS NOT NULL;

-- F. Create function to update total_active_clients for organizations
CREATE OR REPLACE FUNCTION update_org_active_clients()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total active clients count for the organization
  UPDATE organizations
  SET total_active_clients = (
    SELECT COUNT(DISTINCT l.loan_id)
    FROM loans l
    JOIN borrowers b ON l.borrower_id = b.borrower_id
    WHERE b.department_company = NEW.organization_name
    AND l.loan_status = 'active'
  )
  WHERE organization_name = NEW.organization_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- G. Create trigger to keep organization client counts updated
CREATE TRIGGER trg_update_org_clients_on_loan_change
AFTER INSERT OR UPDATE OF loan_status ON loans
FOR EACH ROW
EXECUTE FUNCTION update_org_active_clients();