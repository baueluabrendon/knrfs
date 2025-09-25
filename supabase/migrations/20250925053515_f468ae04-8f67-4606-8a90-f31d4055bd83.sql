-- Add application_type column to applications table to distinguish between new loans and refinances
ALTER TABLE applications ADD COLUMN application_type text DEFAULT 'new_loan' CHECK (application_type IN ('new_loan', 'refinance'));

-- Add refinanced_from_loan_id to track which loan is being refinanced
ALTER TABLE applications ADD COLUMN refinanced_from_loan_id text;

-- Add foreign key constraint for refinanced_from_loan_id
ALTER TABLE applications ADD CONSTRAINT fk_applications_refinanced_from_loan 
  FOREIGN KEY (refinanced_from_loan_id) REFERENCES loans(loan_id);

-- Add comment for clarity
COMMENT ON COLUMN applications.application_type IS 'Type of application: new_loan or refinance';
COMMENT ON COLUMN applications.refinanced_from_loan_id IS 'Original loan ID when this is a refinance application';