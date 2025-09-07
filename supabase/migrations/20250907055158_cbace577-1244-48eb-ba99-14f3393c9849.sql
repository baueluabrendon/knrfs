-- First, let's see the current triggers on repayments table and clean up
DROP TRIGGER IF EXISTS trg_process_repayment ON repayments;
DROP TRIGGER IF EXISTS trg_process_repayment_on_insert ON repayments;
DROP TRIGGER IF EXISTS trg_process_repayment_on_update ON repayments;
DROP TRIGGER IF EXISTS trg_sync_repayment_status ON repayments;

-- Drop existing trigger functions
DROP FUNCTION IF EXISTS trg_process_repayment_on_verification() CASCADE;
DROP FUNCTION IF EXISTS sync_repayment_status() CASCADE;

-- Create a new trigger function that only processes approved repayments
CREATE OR REPLACE FUNCTION public.trg_process_repayment_on_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process repayment if it's approved
    IF NEW.verification_status = 'approved' THEN
        -- For INSERT: only process if it's approved (system entries)
        IF TG_OP = 'INSERT' THEN
            IF NEW.verification_status = 'approved' THEN
                CALL process_repayment(NEW.loan_id, NEW.payment_date, NEW.amount);
            END IF;
        -- For UPDATE: only process if verification_status changed to approved
        ELSIF TG_OP = 'UPDATE' THEN
            IF OLD.verification_status != 'approved' AND NEW.verification_status = 'approved' THEN
                CALL process_repayment(NEW.loan_id, NEW.payment_date, NEW.amount);
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new triggers for both INSERT and UPDATE
CREATE TRIGGER trg_process_repayment_on_insert
    AFTER INSERT ON repayments
    FOR EACH ROW
    EXECUTE FUNCTION trg_process_repayment_on_verification();

CREATE TRIGGER trg_process_repayment_on_update
    AFTER UPDATE ON repayments
    FOR EACH ROW
    EXECUTE FUNCTION trg_process_repayment_on_verification();

-- Also ensure the status is properly updated when verification_status changes
CREATE OR REPLACE FUNCTION public.sync_repayment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync status with verification_status for better consistency
    IF NEW.verification_status = 'approved' THEN
        NEW.status = 'completed';
    ELSIF NEW.verification_status = 'rejected' THEN
        NEW.status = 'failed';
    ELSIF NEW.verification_status = 'pending' THEN
        NEW.status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_repayment_status
    BEFORE UPDATE ON repayments
    FOR EACH ROW
    WHEN (OLD.verification_status IS DISTINCT FROM NEW.verification_status)
    EXECUTE FUNCTION sync_repayment_status();