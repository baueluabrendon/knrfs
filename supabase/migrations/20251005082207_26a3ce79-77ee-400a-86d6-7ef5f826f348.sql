-- Add new columns to deduction_request_clients for enhanced deduction tracking
ALTER TABLE public.deduction_request_clients
ADD COLUMN fortnightly_installment NUMERIC(10,2),
ADD COLUMN pay_period TEXT,
ADD COLUMN scheduled_repayment_amount NUMERIC(10,2),
ADD COLUMN missed_payment_date DATE;

-- Create indexes for faster queries on organization names
CREATE INDEX IF NOT EXISTS idx_payroll_officers_org 
ON public.payroll_officers(organization_name);

CREATE INDEX IF NOT EXISTS idx_deduction_requests_org 
ON public.deduction_requests(organization_name);

-- Add index on repayment_schedule for faster default queries
CREATE INDEX IF NOT EXISTS idx_repayment_schedule_defaults 
ON public.repayment_schedule(statusrs, due_date) 
WHERE statusrs = 'default';

COMMENT ON COLUMN public.deduction_request_clients.fortnightly_installment IS 'Regular fortnightly loan repayment amount';
COMMENT ON COLUMN public.deduction_request_clients.pay_period IS 'Pay period when payment was missed (e.g., Pay 1, Pay 2)';
COMMENT ON COLUMN public.deduction_request_clients.scheduled_repayment_amount IS 'Amount that was due for the missed payment';
COMMENT ON COLUMN public.deduction_request_clients.missed_payment_date IS 'Date when payment was due';