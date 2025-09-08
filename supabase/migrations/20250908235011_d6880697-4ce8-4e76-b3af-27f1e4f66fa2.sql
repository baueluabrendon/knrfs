-- Update user_profiles table to ensure branch_id is properly handled
-- Add RLS policies for branch-based access control

-- Enable RLS on borrowers table if not already enabled
ALTER TABLE public.borrowers ENABLE ROW LEVEL SECURITY;

-- Enable RLS on loans table if not already enabled  
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Enable RLS on repayments table if not already enabled
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on defaults table if not already enabled
ALTER TABLE public.defaults ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Branch officers can only see borrowers from their branch
CREATE POLICY "Branch officers see own branch borrowers" ON public.borrowers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (
        up.role IN ('administrator', 'super user') 
        OR up.branch_id = borrowers.branch_id
      )
    )
  );

-- RLS Policy: Branch officers can only see loans from their branch (through borrower)
CREATE POLICY "Branch officers see own branch loans" ON public.loans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (
        up.role IN ('administrator', 'super user') 
        OR up.branch_id IN (
          SELECT b.branch_id FROM public.borrowers b WHERE b.borrower_id = loans.borrower_id
        )
      )
    )
  );

-- RLS Policy: Branch officers can only see repayments from their branch (through borrower via loan)
CREATE POLICY "Branch officers see own branch repayments" ON public.repayments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (
        up.role IN ('administrator', 'super user') 
        OR up.branch_id IN (
          SELECT b.branch_id 
          FROM public.borrowers b 
          JOIN public.loans l ON b.borrower_id = l.borrower_id 
          WHERE l.loan_id = repayments.loan_id
        )
      )
    )
  );

-- RLS Policy: Branch officers can only see defaults from their branch (through borrower via loan via repayment_schedule)
CREATE POLICY "Branch officers see own branch defaults" ON public.defaults
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (
        up.role IN ('administrator', 'super user') 
        OR up.branch_id IN (
          SELECT b.branch_id 
          FROM public.borrowers b 
          JOIN public.loans l ON b.borrower_id = l.borrower_id 
          JOIN public.repayment_schedule rs ON l.loan_id = rs.loan_id
          WHERE rs.schedule_id = defaults.schedule_id
        )
      )
    )
  );

-- Update existing policies on branches table to allow branch filtering
DROP POLICY IF EXISTS "Staff can view all branches" ON public.branches;

CREATE POLICY "Branch officers see relevant branches" ON public.branches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (
        up.role IN ('administrator', 'super user') 
        OR up.branch_id = branches.id
      )
    )
  );