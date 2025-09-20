-- Normalize branch field in borrowers table
-- Rename company_branch to branch_name for consistency
ALTER TABLE public.borrowers 
RENAME COLUMN company_branch TO branch_name;

-- Add comment to clarify the field usage
COMMENT ON COLUMN public.borrowers.branch_name IS 'Branch name used to identify and set the branch_id field';