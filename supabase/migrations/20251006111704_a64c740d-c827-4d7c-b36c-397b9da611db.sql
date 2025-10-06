-- =====================================================
-- COMPREHENSIVE REPORTS SYSTEM - DATABASE SCHEMA
-- =====================================================

-- 1. PROMOTION CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.promotion_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  email_subject TEXT NOT NULL,
  email_content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0
);

-- 2. PROMOTION RECIPIENTS TABLE
CREATE TABLE IF NOT EXISTS public.promotion_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.promotion_campaigns(id) ON DELETE CASCADE,
  borrower_id VARCHAR REFERENCES public.borrowers(borrower_id),
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. APPLICATION AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS public.application_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT REFERENCES public.applications(application_id),
  action_type TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  performed_by_name TEXT,
  performed_by_role TEXT,
  previous_status TEXT,
  new_status TEXT,
  changes_made JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RECOVERY NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.recovery_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_type TEXT NOT NULL,
  loan_id VARCHAR REFERENCES public.loans(loan_id),
  borrower_id VARCHAR REFERENCES public.borrowers(borrower_id),
  reference_id UUID,
  sent_by UUID REFERENCES auth.users(id),
  sent_by_name TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  recipient_email TEXT,
  recipient_phone TEXT,
  subject TEXT,
  content TEXT,
  status TEXT DEFAULT 'sent',
  response_received BOOLEAN DEFAULT false,
  response_date TIMESTAMPTZ
);

-- 5. ADD COLUMNS TO APPLICATIONS TABLE
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS declined_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS submitted_by TEXT,
ADD COLUMN IF NOT EXISTS submission_date TIMESTAMPTZ DEFAULT now();

-- 6. CREATE FUNCTION TO LOG RECOVERY NOTICES
CREATE OR REPLACE FUNCTION public.log_recovery_notice(
  p_notice_type TEXT,
  p_loan_id VARCHAR,
  p_borrower_id VARCHAR,
  p_reference_id UUID,
  p_recipient_email TEXT,
  p_subject TEXT,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notice_id UUID;
  v_user_profile RECORD;
BEGIN
  -- Get current user profile
  SELECT user_id, first_name, last_name
  INTO v_user_profile
  FROM user_profiles
  WHERE user_id = auth.uid();
  
  -- Insert recovery notice
  INSERT INTO recovery_notices (
    notice_type,
    loan_id,
    borrower_id,
    reference_id,
    sent_by,
    sent_by_name,
    recipient_email,
    subject,
    content,
    status
  ) VALUES (
    p_notice_type,
    p_loan_id,
    p_borrower_id,
    p_reference_id,
    v_user_profile.user_id,
    COALESCE(v_user_profile.first_name || ' ' || v_user_profile.last_name, 'System'),
    p_recipient_email,
    p_subject,
    p_content,
    'sent'
  )
  RETURNING id INTO v_notice_id;
  
  RETURN v_notice_id;
END;
$$;

-- 7. CREATE TRIGGER FUNCTION FOR APPLICATION AUDIT TRAIL
CREATE OR REPLACE FUNCTION public.log_application_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_profile RECORD;
  v_action_type TEXT;
  v_changes JSONB := '{}'::jsonb;
BEGIN
  -- Get current user profile
  SELECT user_id, first_name, last_name, role
  INTO v_user_profile
  FROM user_profiles
  WHERE user_id = auth.uid();
  
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    v_action_type := 'submitted';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      IF NEW.status = 'approved' THEN
        v_action_type := 'approved';
        NEW.approved_by := auth.uid();
        NEW.approved_at := now();
      ELSIF NEW.status = 'declined' THEN
        v_action_type := 'declined';
        NEW.declined_by := auth.uid();
        NEW.declined_at := now();
      ELSIF NEW.status = 'under_review' THEN
        v_action_type := 'reviewed';
        NEW.reviewed_by := auth.uid();
        NEW.reviewed_at := now();
      ELSE
        v_action_type := 'modified';
      END IF;
    ELSE
      v_action_type := 'modified';
    END IF;
    
    -- Track changes
    IF OLD.jsonb_data IS DISTINCT FROM NEW.jsonb_data THEN
      v_changes := jsonb_build_object('data_modified', true);
    END IF;
  END IF;
  
  -- Insert audit trail
  INSERT INTO application_audit_trail (
    application_id,
    action_type,
    performed_by,
    performed_by_name,
    performed_by_role,
    previous_status,
    new_status,
    changes_made
  ) VALUES (
    NEW.application_id,
    v_action_type,
    v_user_profile.user_id,
    COALESCE(v_user_profile.first_name || ' ' || v_user_profile.last_name, 'System'),
    v_user_profile.role,
    OLD.status,
    NEW.status,
    v_changes
  );
  
  RETURN NEW;
END;
$$;

-- 8. CREATE TRIGGER FOR APPLICATIONS TABLE
DROP TRIGGER IF EXISTS trg_log_application_change ON public.applications;
CREATE TRIGGER trg_log_application_change
  BEFORE INSERT OR UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_application_change();

-- 9. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_promotion_campaigns_created_by ON public.promotion_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_promotion_campaigns_status ON public.promotion_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_promotion_recipients_campaign_id ON public.promotion_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_promotion_recipients_borrower_id ON public.promotion_recipients(borrower_id);
CREATE INDEX IF NOT EXISTS idx_application_audit_trail_application_id ON public.application_audit_trail(application_id);
CREATE INDEX IF NOT EXISTS idx_application_audit_trail_performed_by ON public.application_audit_trail(performed_by);
CREATE INDEX IF NOT EXISTS idx_recovery_notices_loan_id ON public.recovery_notices(loan_id);
CREATE INDEX IF NOT EXISTS idx_recovery_notices_sent_by ON public.recovery_notices(sent_by);
CREATE INDEX IF NOT EXISTS idx_recovery_notices_notice_type ON public.recovery_notices(notice_type);
CREATE INDEX IF NOT EXISTS idx_applications_reviewed_by ON public.applications(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_applications_approved_by ON public.applications(approved_by);
CREATE INDEX IF NOT EXISTS idx_applications_submission_date ON public.applications(submission_date);