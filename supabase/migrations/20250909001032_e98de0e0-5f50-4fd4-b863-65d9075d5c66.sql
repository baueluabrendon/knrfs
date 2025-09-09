-- Create activity log table to track officer activities
CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_name text NOT NULL,
    user_role text NOT NULL,
    branch_id uuid REFERENCES public.branches(id),
    activity_type text NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'PROCESS'
    table_name text NOT NULL, -- 'loans', 'borrowers', 'repayments', etc.
    record_id text, -- ID of the affected record
    description text NOT NULL,
    metadata jsonb, -- Additional context data
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_branch_id ON public.activity_logs(branch_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX idx_activity_logs_activity_type ON public.activity_logs(activity_type);
CREATE INDEX idx_activity_logs_table_name ON public.activity_logs(table_name);

-- RLS Policy: Only super users and administrators can view all activity logs
CREATE POLICY "Super users can view all activity logs" ON public.activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('administrator', 'super user')
    )
  );

-- RLS Policy: Allow inserting activity logs for authenticated users (for logging purposes)
CREATE POLICY "Allow inserting activity logs" ON public.activity_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policy: Users can view their own activity logs
CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Create function to log activities
CREATE OR REPLACE FUNCTION public.log_activity(
  p_activity_type text,
  p_table_name text,
  p_record_id text DEFAULT NULL,
  p_description text DEFAULT '',
  p_metadata jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_profile RECORD;
BEGIN
  -- Get current user profile
  SELECT user_id, first_name, last_name, role, branch_id
  INTO v_user_profile
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  
  -- Only log activities for non-super users (regular officers)
  IF v_user_profile.role NOT IN ('administrator', 'super user') THEN
    INSERT INTO public.activity_logs (
      user_id,
      user_name,
      user_role,
      branch_id,
      activity_type,
      table_name,
      record_id,
      description,
      metadata
    ) VALUES (
      v_user_profile.user_id,
      COALESCE(v_user_profile.first_name || ' ' || v_user_profile.last_name, 'Unknown User'),
      v_user_profile.role,
      v_user_profile.branch_id,
      p_activity_type,
      p_table_name,
      p_record_id,
      p_description,
      p_metadata
    );
  END IF;
END;
$$;