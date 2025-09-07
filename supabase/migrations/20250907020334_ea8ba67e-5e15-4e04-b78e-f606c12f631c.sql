-- Fix default verification_status for proper workflow
-- Client submitted repayments should default to 'pending' verification
-- Only system/admin repayments should default to 'approved'

-- First, let's create a trigger to handle verification_status based on source
CREATE OR REPLACE FUNCTION set_verification_status_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If source is 'client', set verification_status to 'pending'
  -- If source is 'system' or NULL, set verification_status to 'approved'
  IF NEW.source = 'client' THEN
    NEW.verification_status := 'pending';
    NEW.status := 'pending'; -- Client submissions start as pending
  ELSE
    NEW.verification_status := 'approved';
    NEW.status := COALESCE(NEW.status, 'completed'); -- System entries default to completed
  END IF;

  -- Set user_id from current auth user if not provided
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on repayments table
DROP TRIGGER IF EXISTS trigger_set_verification_status ON repayments;
CREATE TRIGGER trigger_set_verification_status
  BEFORE INSERT ON repayments
  FOR EACH ROW
  EXECUTE FUNCTION set_verification_status_on_insert();

-- Update existing client repayments that should be pending verification
UPDATE repayments 
SET verification_status = 'pending', 
    status = 'pending'
WHERE source = 'client' 
  AND verification_status = 'approved' 
  AND status = 'completed';