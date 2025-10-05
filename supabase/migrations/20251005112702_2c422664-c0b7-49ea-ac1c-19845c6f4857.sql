-- Fix security warning for the update_org_active_clients function
CREATE OR REPLACE FUNCTION update_org_active_clients()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update total active clients count for the organization
  UPDATE organizations
  SET total_active_clients = (
    SELECT COUNT(DISTINCT l.loan_id)
    FROM loans l
    JOIN borrowers b ON l.borrower_id = b.borrower_id
    WHERE b.department_company = NEW.organization_name
    AND l.loan_status = 'active'
  )
  WHERE organization_name = NEW.organization_name;
  
  RETURN NEW;
END;
$$;