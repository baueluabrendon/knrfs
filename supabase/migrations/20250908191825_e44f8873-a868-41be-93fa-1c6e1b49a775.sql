-- Drop existing dashboard views
DROP VIEW IF EXISTS public.dashboard_analytics_view CASCADE;
DROP VIEW IF EXISTS public.dashboard_metrics_view CASCADE;

-- Create comprehensive dashboard view
CREATE OR REPLACE VIEW public.dashboard_comprehensive_view AS
WITH date_series AS (
  -- Generate a series of dates for the last 5 years
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '5 years',
    CURRENT_DATE,
    INTERVAL '1 day'
  )::date AS analysis_date
),
daily_metrics AS (
  SELECT 
    ds.analysis_date,
    EXTRACT(year FROM ds.analysis_date) AS year,
    EXTRACT(month FROM ds.analysis_date) AS month,
    EXTRACT(week FROM ds.analysis_date) AS week,
    EXTRACT(day FROM ds.analysis_date) AS day,
    EXTRACT(quarter FROM ds.analysis_date) AS quarter,
    
    -- Loan disbursements (loans created on this date)
    COALESCE(SUM(l.principal) FILTER (WHERE l.disbursement_date = ds.analysis_date), 0) AS principal_released,
    COUNT(l.loan_id) FILTER (WHERE l.disbursement_date = ds.analysis_date) AS loans_released_count,
    COALESCE(SUM(l.gross_loan) FILTER (WHERE l.disbursement_date = ds.analysis_date), 0) AS total_loan_amount,
    
    -- Collections (verified repayments on this date)
    COALESCE(SUM(r.amount) FILTER (WHERE r.payment_date = ds.analysis_date AND r.verification_status = 'approved'), 0) AS total_collections,
    COUNT(r.repayment_id) FILTER (WHERE r.payment_date = ds.analysis_date AND r.verification_status = 'approved') AS repayments_collected_count,
    
    -- Scheduled repayments due on this date
    COALESCE(SUM(rs.repaymentrs) FILTER (WHERE rs.due_date = ds.analysis_date), 0) AS total_due_amount,
    COUNT(rs.schedule_id) FILTER (WHERE rs.due_date = ds.analysis_date) AS repayments_due_count,
    
    -- Fee collections
    COALESCE(SUM(rs.received_documentation_fee) FILTER (WHERE rs.settled_date = ds.analysis_date), 0) AS doc_fees_collected,
    COALESCE(SUM(rs.received_loan_risk_insurance) FILTER (WHERE rs.settled_date = ds.analysis_date), 0) AS risk_insurance_collected,
    COALESCE(SUM(d.default_amount) FILTER (WHERE d.date = ds.analysis_date), 0) AS default_fees_collected,
    
    -- Active loans count (as of this date)
    COUNT(l.loan_id) FILTER (WHERE l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)) AS active_loans_count,
    
    -- Settled loans count (settled on this date)
    COUNT(l.loan_id) FILTER (WHERE l.settled_date = ds.analysis_date) AS settled_loans_count,
    
    -- Outstanding balance (as of this date)
    COALESCE(SUM(l.outstanding_balance) FILTER (WHERE l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)), 0) AS total_outstanding,
    
    -- Arrears amount (as of this date)
    COALESCE(SUM(l.arrears) FILTER (WHERE l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)), 0) AS total_arrears_amount,
    
    -- New borrowers (first loan disbursed on this date)
    COUNT(DISTINCT l.borrower_id) FILTER (
      WHERE l.disbursement_date = ds.analysis_date 
      AND NOT EXISTS (
        SELECT 1 FROM loans l2 
        WHERE l2.borrower_id = l.borrower_id 
        AND l2.disbursement_date < ds.analysis_date
      )
    ) AS new_borrowers_count,
    
    -- Active borrowers count (as of this date)
    COUNT(DISTINCT l.borrower_id) FILTER (WHERE l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)) AS active_borrowers_count,
    
    -- Gender distribution (for loans disbursed up to this date)
    COUNT(DISTINCT b.borrower_id) FILTER (WHERE b.gender = 'Male' AND l.disbursement_date <= ds.analysis_date) AS male_count,
    COUNT(DISTINCT b.borrower_id) FILTER (WHERE b.gender = 'Female' AND l.disbursement_date <= ds.analysis_date) AS female_count,
    
    -- Client types based on payroll type (active as of this date)
    COUNT(DISTINCT rs.loan_id) FILTER (WHERE rs.payroll_type = 'public_servant' AND l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)) AS public_service_count,
    COUNT(DISTINCT rs.loan_id) FILTER (WHERE rs.payroll_type = 'company' AND l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)) AS private_company_count,
    
    -- Default counts and amounts
    COUNT(d.arrear_id) FILTER (WHERE d.date = ds.analysis_date) AS defaults_count,
    COALESCE(SUM(d.default_amount) FILTER (WHERE d.date = ds.analysis_date), 0) AS total_default_amount,
    
    -- Defaults by client type
    COUNT(d.arrear_id) FILTER (WHERE d.date = ds.analysis_date AND rs.payroll_type = 'public_servant') AS public_defaults,
    COUNT(d.arrear_id) FILTER (WHERE d.date = ds.analysis_date AND rs.payroll_type = 'company') AS private_defaults,
    
    -- Loan status counts (as of this date)
    COUNT(l.loan_id) FILTER (WHERE l.loan_status = 'active' AND l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)) AS active_status_count,
    COUNT(l.loan_id) FILTER (WHERE l.loan_status = 'overdue' AND l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)) AS overdue_status_count,
    COUNT(l.loan_id) FILTER (WHERE l.loan_status = 'settled' AND l.settled_date <= ds.analysis_date) AS settled_status_count,
    
    -- Payment status counts
    COUNT(l.loan_id) FILTER (WHERE l.loan_repayment_status = 'on time' AND l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)) AS on_time_count,
    COUNT(l.loan_id) FILTER (WHERE l.loan_repayment_status = 'partial' AND l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)) AS partial_payments_count,
    COUNT(l.loan_id) FILTER (WHERE l.loan_repayment_status = 'default' AND l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)) AS default_payments_count,
    
    -- Missed and partial payment counts
    COALESCE(SUM(l.missed_payments_count) FILTER (WHERE l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)), 0) AS total_missed_payments,
    COALESCE(SUM(l.partial_payments_count) FILTER (WHERE l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)), 0) AS total_partial_payments,
    
    -- At risk loans (loans with missed or partial payments)
    COUNT(l.loan_id) FILTER (WHERE (l.missed_payments_count > 0 OR l.partial_payments_count > 0) AND l.disbursement_date <= ds.analysis_date AND (l.settled_date IS NULL OR l.settled_date > ds.analysis_date)) AS at_risk_loans_count,
    
    -- Applications count (as of this date)
    COUNT(a.application_id) FILTER (WHERE a.uploaded_at::date <= ds.analysis_date) AS total_applications_count,
    COUNT(a.application_id) FILTER (WHERE a.uploaded_at::date <= ds.analysis_date AND a.status = 'pending') AS pending_applications_count,
    COUNT(a.application_id) FILTER (WHERE a.uploaded_at::date <= ds.analysis_date AND a.status = 'approved') AS approved_applications_count,
    COUNT(a.application_id) FILTER (WHERE a.uploaded_at::date <= ds.analysis_date AND a.status = 'rejected') AS rejected_applications_count,
    
    -- Cumulative totals (as of this date)
    COALESCE(SUM(l.total_repayment) FILTER (WHERE l.disbursement_date <= ds.analysis_date), 0) AS total_repayments_amount,
    COALESCE(SUM(l.default_fees_accumulated) FILTER (WHERE l.disbursement_date <= ds.analysis_date), 0) AS total_default_fees_accumulated,
    COALESCE(SUM(l.principal_accumulated) FILTER (WHERE l.disbursement_date <= ds.analysis_date), 0) AS total_principal_accumulated,
    COALESCE(SUM(l.interest_accumulated) FILTER (WHERE l.disbursement_date <= ds.analysis_date), 0) AS total_interest_accumulated,
    
    -- Average loan duration (for settled loans as of this date)
    COALESCE(AVG(l.settled_date - l.disbursement_date) FILTER (WHERE l.settled_date <= ds.analysis_date), INTERVAL '0 days') AS avg_loan_duration_days,
    
    -- Collection efficiency (collections vs scheduled)
    CASE 
      WHEN COALESCE(SUM(rs.repaymentrs) FILTER (WHERE rs.due_date <= ds.analysis_date), 0) > 0 
      THEN (COALESCE(SUM(r.amount) FILTER (WHERE r.payment_date <= ds.analysis_date AND r.verification_status = 'approved'), 0) * 100.0) / COALESCE(SUM(rs.repaymentrs) FILTER (WHERE rs.due_date <= ds.analysis_date), 1)
      ELSE 0 
    END AS collection_efficiency_percentage

  FROM date_series ds
  LEFT JOIN loans l ON l.disbursement_date <= ds.analysis_date
  LEFT JOIN borrowers b ON l.borrower_id = b.borrower_id
  LEFT JOIN repayments r ON r.loan_id = l.loan_id
  LEFT JOIN repayment_schedule rs ON rs.loan_id = l.loan_id
  LEFT JOIN defaults d ON d.schedule_id = rs.schedule_id
  LEFT JOIN applications a ON a.uploaded_at::date <= ds.analysis_date
  GROUP BY ds.analysis_date
)
SELECT * FROM daily_metrics
ORDER BY analysis_date DESC;