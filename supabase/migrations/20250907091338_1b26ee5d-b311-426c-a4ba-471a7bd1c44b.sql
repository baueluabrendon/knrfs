-- Add branch_id column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN branch_id uuid REFERENCES public.branches(id);

-- Add index for better performance
CREATE INDEX idx_user_profiles_branch_id ON public.user_profiles(branch_id);