-- Add client_type column to borrowers table to categorize clients by employer type
ALTER TABLE public.borrowers ADD COLUMN client_type TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.borrowers.client_type IS 'Client type based on employer: public, statutory, company';

-- Add check constraint for valid client types
ALTER TABLE public.borrowers ADD CONSTRAINT check_client_type 
CHECK (client_type IS NULL OR client_type IN ('public', 'statutory', 'company'));

-- Add employer_type column to applications table to capture employer selection
ALTER TABLE public.applications ADD COLUMN employer_type TEXT;

-- Add comment and constraint for applications employer_type
COMMENT ON COLUMN public.applications.employer_type IS 'Employer type selected during application: public, statutory, company';
ALTER TABLE public.applications ADD CONSTRAINT check_employer_type 
CHECK (employer_type IS NULL OR employer_type IN ('public', 'statutory', 'company'));