-- Add branch_id column to borrowers table to track which branch each borrower belongs to
ALTER TABLE public.borrowers 
ADD COLUMN branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_borrowers_branch_id ON public.borrowers(branch_id);

-- Add a comment to document the relationship
COMMENT ON COLUMN public.borrowers.branch_id IS 'Foreign key reference to branches table - indicates which branch this borrower is associated with';