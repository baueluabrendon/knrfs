-- Fix security issue with log_activity function
DROP FUNCTION IF EXISTS public.log_activity(text, text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.log_activity(
  p_activity_type text,
  p_table_name text,
  p_record_id text DEFAULT NULL,
  p_description text DEFAULT '',
  p_metadata jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_profile RECORD;
BEGIN
  -- Get current user profile
  SELECT user_id, first_name, last_name, role, branch_id
  INTO v_user_profile
  FROM user_profiles
  WHERE user_id = auth.uid();
  
  -- Only log activities for non-super users (regular officers)
  IF v_user_profile.role NOT IN ('administrator', 'super user') THEN
    INSERT INTO activity_logs (
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