-- Fix dashboard_analytics_with_branches view for accurate chart data
-- This addresses 3 critical issues:
-- 1. Repayments Due: Show actual amounts due per period (not all pending)
-- 2. Outstanding Balance: Calculate time-series historical balance (not static current value)
-- 3. Active Loans Count: Properly count loans active during each period

DROP VIEW IF EXISTS dashboard_analytics_with_branches CASCADE;

CREATE VIEW dashboard_analytics_with_branches AS
WITH RECURSIVE periods AS (
  -- Generate date series for analysis
  SELECT 
    date_trunc('day', generate_series(
      (SELECT MIN(disbursement_date) FROM loans),
      CURRENT_DATE,
      '1 day'::interval
    ))::date as analysis_date
),
period_enrichment AS (
  SELECT 
    analysis_date,
    EXTRACT(YEAR FROM analysis_date)::integer as year,
    EXTRACT(MONTH FROM analysis_date)::integer as month,
    EXTRACT(DAY FROM analysis_date)::integer as day,
    EXTRACT(WEEK FROM analysis_date)::integer as week,
    EXTRACT(QUARTER FROM analysis_date)::integer as quarter
  FROM periods
),
-- FIX 1: Repayments Due - Group by actual due_date to show period-specific amounts
repayments_due AS (
  SELECT 
    rs.due_date::date as analysis_date,
    l.borrower_id,
    b.branch_id,
    COUNT(*) FILTER (WHERE rs.statusrs = 'pending') as repayments_due_count,
    COALESCE(SUM(CASE 
      WHEN rs.statusrs IN ('pending', 'partial') 
      THEN rs.repaymentrs - COALESCE(rs.repayment_received, 0) 
      ELSE 0 
    END), 0) as total_due_amount,
    COALESCE(SUM(CASE 
      WHEN rs.statusrs IN ('pending', 'partial') 
      THEN rs.principalrs - COALESCE(rs.received_principal, 0) 
      ELSE 0 
    END), 0) as principal_due,
    COALESCE(SUM(CASE 
      WHEN rs.statusrs IN ('pending', 'partial') 
      THEN rs.interestrs - COALESCE(rs.received_interest, 0) 
      ELSE 0 
    END), 0) as interest_due,
    COALESCE(SUM(CASE 
      WHEN rs.statusrs IN ('pending', 'partial') 
      THEN rs.documentation_feers - COALESCE(rs.received_documentation_fee, 0) 
      ELSE 0 
    END), 0) as doc_fees_due,
    COALESCE(SUM(CASE 
      WHEN rs.statusrs IN ('pending', 'partial') 
      THEN rs.loan_risk_insurancers - COALESCE(rs.received_loan_risk_insurance, 0) 
      ELSE 0 
    END), 0) as risk_insurance_due,
    COALESCE(SUM(CASE 
      WHEN rs.statusrs IN ('pending', 'partial') 
      THEN rs.gst_amountrs - COALESCE(rs.received_gst_amount, 0) 
      ELSE 0 
    END), 0) as gst_due,
    COUNT(*) FILTER (WHERE rs.statusrs = 'pending') as pending_schedules,
    COUNT(*) FILTER (WHERE rs.statusrs = 'paid') as paid_schedules,
    COUNT(*) FILTER (WHERE rs.statusrs = 'partial') as partial_schedules,
    COUNT(*) FILTER (WHERE rs.statusrs = 'default') as defaulted_schedules,
    rs.payroll_type
  FROM repayment_schedule rs
  JOIN loans l ON rs.loan_id = l.loan_id
  JOIN borrowers b ON l.borrower_id = b.borrower_id
  WHERE l.loan_status IN ('active', 'overdue')
  GROUP BY rs.due_date, l.borrower_id, b.branch_id, rs.payroll_type
),
loans_released AS (
  SELECT 
    l.disbursement_date as analysis_date,
    l.borrower_id,
    b.branch_id,
    b.client_type,
    COUNT(*) as loans_released_count,
    COALESCE(SUM(l.principal), 0) as principal_released,
    COALESCE(SUM(l.gross_loan), 0) as total_loan_amount
  FROM loans l
  JOIN borrowers b ON l.borrower_id = b.borrower_id
  GROUP BY l.disbursement_date, l.borrower_id, b.branch_id, b.client_type
),
repayments_collected AS (
  SELECT 
    r.payment_date as analysis_date,
    l.borrower_id,
    b.branch_id,
    COUNT(*) as repayments_collected_count,
    COALESCE(SUM(r.amount), 0) as total_collections
  FROM repayments r
  JOIN loans l ON r.loan_id = l.loan_id
  JOIN borrowers b ON l.borrower_id = b.borrower_id
  WHERE r.verification_status = 'approved'
  GROUP BY r.payment_date, l.borrower_id, b.branch_id
),
fee_collections AS (
  SELECT 
    rs.settled_date as analysis_date,
    l.borrower_id,
    b.branch_id,
    COALESCE(SUM(rs.received_documentation_fee), 0) as doc_fees_collected,
    COALESCE(SUM(rs.received_loan_risk_insurance), 0) as risk_insurance_collected,
    COALESCE(SUM(rs.received_gst_amount), 0) as gst_collected,
    COALESCE(SUM(rs.default_charged), 0) as default_fees_collected
  FROM repayment_schedule rs
  JOIN loans l ON rs.loan_id = l.loan_id
  JOIN borrowers b ON l.borrower_id = b.borrower_id
  WHERE rs.settled_date IS NOT NULL
  GROUP BY rs.settled_date, l.borrower_id, b.branch_id
),
defaults_data AS (
  SELECT 
    d.date as analysis_date,
    l.borrower_id,
    b.branch_id,
    b.client_type,
    COUNT(*) as defaults_count,
    COALESCE(SUM(d.default_amount), 0) as total_default_amount
  FROM defaults d
  JOIN repayment_schedule rs ON d.schedule_id = rs.schedule_id
  JOIN loans l ON rs.loan_id = l.loan_id
  JOIN borrowers b ON l.borrower_id = b.borrower_id
  GROUP BY d.date, l.borrower_id, b.branch_id, b.client_type
),
new_borrowers AS (
  -- Use first loan disbursement date as borrower creation date
  SELECT 
    MIN(l.disbursement_date) as analysis_date,
    l.borrower_id,
    b.branch_id,
    b.gender,
    b.client_type,
    1 as new_borrowers_count
  FROM loans l
  JOIN borrowers b ON l.borrower_id = b.borrower_id
  GROUP BY l.borrower_id, b.branch_id, b.gender, b.client_type
),
applications_data AS (
  SELECT 
    a.uploaded_at::date as analysis_date,
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE a.status = 'pending') as pending_applications_count,
    COUNT(*) FILTER (WHERE a.status = 'approved') as approved_applications_count,
    COUNT(*) FILTER (WHERE a.status = 'declined') as declined_applications_count
  FROM applications a
  GROUP BY a.uploaded_at::date
)
SELECT 
  p.analysis_date,
  p.year,
  p.month,
  p.day,
  p.week,
  p.quarter,
  br.id as branch_id,
  br.branch_name,
  br.branch_code,
  COALESCE(lr.client_type, nb.client_type, dd.client_type) as client_type,
  COALESCE(rd.payroll_type) as payroll_type,
  
  -- Loan disbursements
  COALESCE(lr.loans_released_count, 0) as loans_released_count,
  COALESCE(lr.principal_released, 0) as principal_released,
  COALESCE(lr.total_loan_amount, 0) as total_loan_amount,
  
  -- Collections
  COALESCE(rc.total_collections, 0) as total_collections,
  COALESCE(rc.repayments_collected_count, 0) as repayments_collected_count,
  
  -- Repayments due (FIX 1: Now shows period-specific amounts)
  COALESCE(rd.total_due_amount, 0) as total_due_amount,
  COALESCE(rd.repayments_due_count, 0) as repayments_due_count,
  COALESCE(rd.principal_due, 0) as principal_due,
  COALESCE(rd.interest_due, 0) as interest_due,
  COALESCE(rd.doc_fees_due, 0) as doc_fees_due,
  COALESCE(rd.risk_insurance_due, 0) as risk_insurance_due,
  COALESCE(rd.gst_due, 0) as gst_due,
  COALESCE(rd.pending_schedules, 0) as pending_schedules,
  COALESCE(rd.paid_schedules, 0) as paid_schedules,
  COALESCE(rd.partial_schedules, 0) as partial_schedules,
  COALESCE(rd.defaulted_schedules, 0) as defaulted_schedules,
  
  -- Fee collections
  COALESCE(fc.doc_fees_collected, 0) as doc_fees_collected,
  COALESCE(fc.risk_insurance_collected, 0) as risk_insurance_collected,
  COALESCE(fc.gst_collected, 0) as gst_collected,
  COALESCE(fc.default_fees_collected, 0) as default_fees_collected,
  
  -- FIX 3: Active loans count with proper date filtering
  (SELECT COUNT(DISTINCT l.loan_id)
   FROM loans l
   JOIN borrowers b ON l.borrower_id = b.borrower_id
   WHERE l.disbursement_date <= p.analysis_date
     AND (l.settled_date IS NULL OR l.settled_date > p.analysis_date)
     AND l.loan_status IN ('active', 'overdue')
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as active_loans_count,
  
  -- Settled loans (cumulative up to this date)
  (SELECT COUNT(DISTINCT l.loan_id)
   FROM loans l
   JOIN borrowers b ON l.borrower_id = b.borrower_id
   WHERE l.settled_date <= p.analysis_date
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as settled_loans_count,
  
  -- Overdue loans
  (SELECT COUNT(DISTINCT l.loan_id)
   FROM loans l
   JOIN borrowers b ON l.borrower_id = b.borrower_id
   WHERE l.loan_status = 'overdue'
     AND l.disbursement_date <= p.analysis_date
     AND (l.settled_date IS NULL OR l.settled_date > p.analysis_date)
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as overdue_loans_count,
  
  -- FIX 2: Time-series outstanding balance calculation
  COALESCE(
    (SELECT SUM(l.gross_loan)
     FROM loans l
     JOIN borrowers b ON l.borrower_id = b.borrower_id
     WHERE l.disbursement_date <= p.analysis_date
       AND (l.settled_date IS NULL OR l.settled_date > p.analysis_date)
       AND (br.id IS NULL OR b.branch_id = br.id)
    ), 0
  ) - COALESCE(
    (SELECT SUM(r.amount)
     FROM repayments r
     JOIN loans l ON r.loan_id = l.loan_id
     JOIN borrowers b ON l.borrower_id = b.borrower_id
     WHERE r.payment_date <= p.analysis_date
       AND r.verification_status = 'approved'
       AND (br.id IS NULL OR b.branch_id = br.id)
    ), 0
  ) + COALESCE(
    (SELECT SUM(d.default_amount)
     FROM defaults d
     JOIN repayment_schedule rs ON d.schedule_id = rs.schedule_id
     JOIN loans l ON rs.loan_id = l.loan_id
     JOIN borrowers b ON l.borrower_id = b.borrower_id
     WHERE d.date <= p.analysis_date
       AND (br.id IS NULL OR b.branch_id = br.id)
    ), 0
  ) as total_outstanding,
  
  -- Arrears
  (SELECT COALESCE(SUM(l.arrears), 0)
   FROM loans l
   JOIN borrowers b ON l.borrower_id = b.borrower_id
   WHERE l.disbursement_date <= p.analysis_date
     AND l.loan_status IN ('active', 'overdue')
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as total_arrears,
  
  -- At-risk loans (with missed or partial payments)
  (SELECT COUNT(DISTINCT l.loan_id)
   FROM loans l
   JOIN borrowers b ON l.borrower_id = b.borrower_id
   WHERE l.disbursement_date <= p.analysis_date
     AND (l.settled_date IS NULL OR l.settled_date > p.analysis_date)
     AND (l.missed_payments_count > 0 OR l.partial_payments_count > 0)
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as at_risk_loans_count,
  
  -- Missed and partial payments
  (SELECT COALESCE(SUM(l.missed_payments_count), 0)
   FROM loans l
   JOIN borrowers b ON l.borrower_id = b.borrower_id
   WHERE l.disbursement_date <= p.analysis_date
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as total_missed_payments,
  
  (SELECT COALESCE(SUM(l.partial_payments_count), 0)
   FROM loans l
   JOIN borrowers b ON l.borrower_id = b.borrower_id
   WHERE l.disbursement_date <= p.analysis_date
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as total_partial_payments,
  
  -- Default fees
  (SELECT COALESCE(SUM(l.default_fees_accumulated), 0)
   FROM loans l
   JOIN borrowers b ON l.borrower_id = b.borrower_id
   WHERE l.disbursement_date <= p.analysis_date
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as total_default_fees,
  
  -- Defaults
  COALESCE(dd.defaults_count, 0) as defaults_count,
  COALESCE(dd.total_default_amount, 0) as total_default_amount,
  
  -- Defaults by client type
  CASE WHEN dd.client_type = 'Public Service' THEN dd.defaults_count ELSE 0 END as public_defaults,
  CASE WHEN dd.client_type = 'Statutory Body' THEN dd.defaults_count ELSE 0 END as statutory_defaults,
  CASE WHEN dd.client_type = 'Private Company' THEN dd.defaults_count ELSE 0 END as private_defaults,
  CASE WHEN dd.client_type = 'Public Service' THEN dd.total_default_amount ELSE 0 END as public_default_amount,
  CASE WHEN dd.client_type = 'Statutory Body' THEN dd.total_default_amount ELSE 0 END as statutory_default_amount,
  CASE WHEN dd.client_type = 'Private Company' THEN dd.total_default_amount ELSE 0 END as private_default_amount,
  
  -- New borrowers
  COALESCE(nb.new_borrowers_count, 0) as new_borrowers_count,
  CASE WHEN nb.gender = 'Male' THEN 1 ELSE 0 END as new_male_borrowers,
  CASE WHEN nb.gender = 'Female' THEN 1 ELSE 0 END as new_female_borrowers,
  CASE WHEN nb.client_type = 'Public Service' THEN 1 ELSE 0 END as new_public_service,
  CASE WHEN nb.client_type = 'Statutory Body' THEN 1 ELSE 0 END as new_statutory_body,
  CASE WHEN nb.client_type = 'Private Company' THEN 1 ELSE 0 END as new_private_company,
  
  -- Gender counts (cumulative)
  (SELECT COUNT(*) 
   FROM (
     SELECT DISTINCT l2.borrower_id, b2.gender
     FROM loans l2
     JOIN borrowers b2 ON l2.borrower_id = b2.borrower_id
     WHERE l2.disbursement_date <= p.analysis_date
       AND b2.gender = 'Male'
       AND (br.id IS NULL OR b2.branch_id = br.id)
   ) sub
  ) as male_count,
  
  (SELECT COUNT(*) 
   FROM (
     SELECT DISTINCT l2.borrower_id, b2.gender
     FROM loans l2
     JOIN borrowers b2 ON l2.borrower_id = b2.borrower_id
     WHERE l2.disbursement_date <= p.analysis_date
       AND b2.gender = 'Female'
       AND (br.id IS NULL OR b2.branch_id = br.id)
   ) sub
  ) as female_count,
  
  -- Client type counts (cumulative active borrowers)
  (SELECT COUNT(DISTINCT b.borrower_id)
   FROM borrowers b
   WHERE b.client_type = 'Public Service'
     AND EXISTS (
       SELECT 1 FROM loans l 
       WHERE l.borrower_id = b.borrower_id 
         AND l.loan_status IN ('active', 'overdue')
         AND l.disbursement_date <= p.analysis_date
     )
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as public_service_count,
  
  (SELECT COUNT(DISTINCT b.borrower_id)
   FROM borrowers b
   WHERE b.client_type = 'Statutory Body'
     AND EXISTS (
       SELECT 1 FROM loans l 
       WHERE l.borrower_id = b.borrower_id 
         AND l.loan_status IN ('active', 'overdue')
         AND l.disbursement_date <= p.analysis_date
     )
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as statutory_body_count,
  
  (SELECT COUNT(DISTINCT b.borrower_id)
   FROM borrowers b
   WHERE b.client_type = 'Private Company'
     AND EXISTS (
       SELECT 1 FROM loans l 
       WHERE l.borrower_id = b.borrower_id 
         AND l.loan_status IN ('active', 'overdue')
         AND l.disbursement_date <= p.analysis_date
     )
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as private_company_count,
  
  -- Pending collections (total_due_amount - what's been collected)
  COALESCE(rd.total_due_amount, 0) - COALESCE(rc.total_collections, 0) as pending_collections,
  
  -- Collection efficiency
  CASE 
    WHEN COALESCE(rd.total_due_amount, 0) > 0 
    THEN (COALESCE(rc.total_collections, 0) / COALESCE(rd.total_due_amount, 1)) * 100
    ELSE 0 
  END as collection_efficiency_percentage,
  
  -- Applications
  COALESCE(ad.total_applications, 0) as total_applications,
  COALESCE(ad.pending_applications_count, 0) as pending_applications_count,
  COALESCE(ad.approved_applications_count, 0) as approved_applications_count,
  COALESCE(ad.declined_applications_count, 0) as declined_applications_count,
  
  -- Average loan duration
  (SELECT COALESCE(AVG(CASE 
     WHEN l.settled_date IS NOT NULL 
     THEN l.settled_date - l.disbursement_date 
     ELSE p.analysis_date - l.disbursement_date 
   END), 0)::integer
   FROM loans l
   JOIN borrowers b ON l.borrower_id = b.borrower_id
   WHERE l.disbursement_date <= p.analysis_date
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as avg_loan_duration_days,
  
  -- Average completion percentage
  (SELECT COALESCE(AVG(l.repayment_completion_percentage), 0)
   FROM loans l
   JOIN borrowers b ON l.borrower_id = b.borrower_id
   WHERE l.disbursement_date <= p.analysis_date
     AND l.loan_status IN ('active', 'overdue')
     AND (br.id IS NULL OR b.branch_id = br.id)
  ) as avg_completion_percentage

FROM period_enrichment p
CROSS JOIN branches br
LEFT JOIN loans_released lr ON lr.analysis_date = p.analysis_date AND lr.branch_id = br.id
LEFT JOIN repayments_collected rc ON rc.analysis_date = p.analysis_date AND rc.branch_id = br.id
LEFT JOIN repayments_due rd ON rd.analysis_date = p.analysis_date AND rd.branch_id = br.id
LEFT JOIN fee_collections fc ON fc.analysis_date = p.analysis_date AND fc.branch_id = br.id
LEFT JOIN defaults_data dd ON dd.analysis_date = p.analysis_date AND dd.branch_id = br.id
LEFT JOIN new_borrowers nb ON nb.analysis_date = p.analysis_date AND nb.branch_id = br.id
LEFT JOIN applications_data ad ON ad.analysis_date = p.analysis_date
WHERE p.analysis_date >= (SELECT MIN(disbursement_date) FROM loans)
ORDER BY p.analysis_date, br.branch_name;