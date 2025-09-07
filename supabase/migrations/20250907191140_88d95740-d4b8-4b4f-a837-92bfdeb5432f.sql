-- Drop the existing dashboard_metrics_view
DROP VIEW IF EXISTS dashboard_metrics_view;

-- Create a comprehensive and accurate dashboard metrics view
CREATE OR REPLACE VIEW dashboard_metrics_view AS
SELECT 
    -- Loan counts
    (SELECT COUNT(*) 
     FROM loans 
     WHERE loan_status IN ('active', 'overdue')) AS active_loans_count,
    
    -- Active borrower count (distinct borrowers with active loans)
    (SELECT COUNT(DISTINCT borrower_id) 
     FROM loans 
     WHERE loan_status IN ('active', 'overdue')) AS active_borrowers_count,
    
    -- At risk loans (overdue status OR has arrears OR missed payments)
    (SELECT COUNT(*) 
     FROM loans 
     WHERE loan_status = 'overdue' 
        OR arrears > 0 
        OR missed_payments_count > 0
        OR loan_repayment_status IN ('default', 'partial')) AS at_risk_loans_count,
    
    -- Pending applications
    (SELECT COUNT(*) 
     FROM applications 
     WHERE status = 'pending') AS pending_applications_count,
    
    -- Total principal amount (all loans ever disbursed)
    (SELECT COALESCE(SUM(principal), 0) 
     FROM loans) AS total_principal_amount,
    
    -- Total outstanding balance (active and overdue loans only)
    (SELECT COALESCE(SUM(outstanding_balance), 0) 
     FROM loans 
     WHERE loan_status IN ('active', 'overdue')) AS total_outstanding_balance,
    
    -- Total repayments from actual repayments table (approved only)
    (SELECT COALESCE(SUM(amount), 0) 
     FROM repayments 
     WHERE verification_status = 'approved') AS total_repayments_amount,
    
    -- Average loan duration for settled loans
    (SELECT COALESCE(AVG(settled_date - disbursement_date), 0) 
     FROM loans 
     WHERE loan_status = 'settled' AND settled_date IS NOT NULL) AS avg_loan_duration_days,
    
    -- Additional useful metrics
    (SELECT COUNT(*) 
     FROM loans 
     WHERE loan_status = 'settled') AS settled_loans_count,
    
    (SELECT COALESCE(SUM(arrears), 0) 
     FROM loans 
     WHERE arrears > 0) AS total_arrears_amount,
    
    (SELECT COALESCE(SUM(default_fees_accumulated), 0) 
     FROM loans 
     WHERE default_fees_accumulated > 0) AS total_default_fees,
    
    (SELECT COUNT(*) 
     FROM loans 
     WHERE missed_payments_count > 0) AS loans_with_missed_payments,
    
    (SELECT COUNT(*) 
     FROM loans 
     WHERE partial_payments_count > 0) AS loans_with_partial_payments,
    
    -- Collection efficiency (total collected vs total disbursed)
    (SELECT CASE 
        WHEN SUM(principal) > 0 
        THEN (SELECT COALESCE(SUM(amount), 0) FROM repayments WHERE verification_status = 'approved') / SUM(principal) * 100
        ELSE 0 
     END 
     FROM loans) AS collection_efficiency_percentage;