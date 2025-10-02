-- Drop existing view
DROP VIEW IF EXISTS dashboard_analytics_with_branches CASCADE;

-- Create improved dashboard analytics view with proper repayments due logic
CREATE VIEW dashboard_analytics_with_branches AS
WITH date_periods AS (
  -- Generate date series with all time period calculations
  SELECT DISTINCT
    rs.due_date::date as analysis_date,
    EXTRACT(YEAR FROM rs.due_date)::integer as year,
    EXTRACT(MONTH FROM rs.due_date)::integer as month,
    EXTRACT(DAY FROM rs.due_date)::integer as day,
    EXTRACT(WEEK FROM rs.due_date)::integer as week,
    EXTRACT(QUARTER FROM rs.due_date)::integer as quarter,
    br.branch_id,
    b_data.branch_name,
    b_data.branch_code,
    l.client__type as client_type,
    rs.payroll_type
  FROM repayment_schedule rs
  JOIN loans l ON l.loan_id = rs.loan_id
  LEFT JOIN borrowers br ON br.borrower_id = l.borrower_id
  LEFT JOIN branches b_data ON b_data.id = br.branch_id
  WHERE rs.due_date IS NOT NULL
),

-- Loans released by disbursement date
loans_released AS (
  SELECT
    l.disbursement_date::date as analysis_date,
    EXTRACT(YEAR FROM l.disbursement_date)::integer as year,
    EXTRACT(MONTH FROM l.disbursement_date)::integer as month,
    EXTRACT(DAY FROM l.disbursement_date)::integer as day,
    EXTRACT(WEEK FROM l.disbursement_date)::integer as week,
    EXTRACT(QUARTER FROM l.disbursement_date)::integer as quarter,
    br.branch_id,
    b.branch_name,
    b.branch_code,
    l.client__type as client_type,
    COUNT(l.loan_id) as loans_released_count,
    COALESCE(SUM(l.principal), 0) as principal_released,
    COALESCE(SUM(l.gross_loan), 0) as total_loan_amount
  FROM loans l
  LEFT JOIN borrowers br ON br.borrower_id = l.borrower_id
  LEFT JOIN branches b ON b.id = br.branch_id
  WHERE l.disbursement_date IS NOT NULL
  GROUP BY l.disbursement_date::date, br.branch_id, b.branch_name, b.branch_code, l.client__type,
           EXTRACT(YEAR FROM l.disbursement_date), EXTRACT(MONTH FROM l.disbursement_date),
           EXTRACT(DAY FROM l.disbursement_date), EXTRACT(WEEK FROM l.disbursement_date),
           EXTRACT(QUARTER FROM l.disbursement_date)
),

-- CRITICAL FIX: Repayments due from ACTIVE LOANS ONLY (forecast data)
repayments_due AS (
  SELECT
    rs.due_date::date as analysis_date,
    EXTRACT(YEAR FROM rs.due_date)::integer as year,
    EXTRACT(MONTH FROM rs.due_date)::integer as month,
    EXTRACT(DAY FROM rs.due_date)::integer as day,
    EXTRACT(WEEK FROM rs.due_date)::integer as week,
    EXTRACT(QUARTER FROM rs.due_date)::integer as quarter,
    br.branch_id,
    b.branch_name,
    b.branch_code,
    l.client__type as client_type,
    rs.payroll_type,
    COUNT(DISTINCT rs.schedule_id) as repayments_due_count,
    COALESCE(SUM(rs.repaymentrs), 0) as total_due_amount,
    COALESCE(SUM(rs.principalrs), 0) as principal_due,
    COALESCE(SUM(rs.interestrs), 0) as interest_due,
    COALESCE(SUM(rs.documentation_feers), 0) as doc_fees_due,
    COALESCE(SUM(rs.loan_risk_insurancers), 0) as risk_insurance_due,
    COALESCE(SUM(rs.gst_amountrs), 0) as gst_due,
    COUNT(CASE WHEN rs.statusrs = 'pending' THEN 1 END) as pending_schedules,
    COUNT(CASE WHEN rs.statusrs = 'paid' THEN 1 END) as paid_schedules,
    COUNT(CASE WHEN rs.statusrs = 'partial' THEN 1 END) as partial_schedules,
    COUNT(CASE WHEN rs.statusrs = 'default' THEN 1 END) as defaulted_schedules
  FROM repayment_schedule rs
  JOIN loans l ON l.loan_id = rs.loan_id
  LEFT JOIN borrowers br ON br.borrower_id = l.borrower_id
  LEFT JOIN branches b ON b.id = br.branch_id
  WHERE rs.due_date IS NOT NULL
    AND l.loan_status IN ('active', 'overdue')  -- Only active/overdue loans for forecast
  GROUP BY rs.due_date::date, br.branch_id, b.branch_name, b.branch_code, l.client__type, rs.payroll_type,
           EXTRACT(YEAR FROM rs.due_date), EXTRACT(MONTH FROM rs.due_date),
           EXTRACT(DAY FROM rs.due_date), EXTRACT(WEEK FROM rs.due_date),
           EXTRACT(QUARTER FROM rs.due_date)
),

-- Collections from actual repayments by payment date
repayments_collected AS (
  SELECT
    r.payment_date::date as analysis_date,
    EXTRACT(YEAR FROM r.payment_date)::integer as year,
    EXTRACT(MONTH FROM r.payment_date)::integer as month,
    EXTRACT(DAY FROM r.payment_date)::integer as day,
    EXTRACT(WEEK FROM r.payment_date)::integer as week,
    EXTRACT(QUARTER FROM r.payment_date)::integer as quarter,
    br.branch_id,
    b.branch_name,
    b.branch_code,
    l.client__type as client_type,
    COUNT(r.repayment_id) as repayments_collected_count,
    COALESCE(SUM(r.amount), 0) as total_collections
  FROM repayments r
  JOIN loans l ON l.loan_id = r.loan_id
  LEFT JOIN borrowers br ON br.borrower_id = l.borrower_id
  LEFT JOIN branches b ON b.id = br.branch_id
  WHERE r.payment_date IS NOT NULL
    AND r.verification_status = 'approved'
  GROUP BY r.payment_date::date, br.branch_id, b.branch_name, b.branch_code, l.client__type,
           EXTRACT(YEAR FROM r.payment_date), EXTRACT(MONTH FROM r.payment_date),
           EXTRACT(DAY FROM r.payment_date), EXTRACT(WEEK FROM r.payment_date),
           EXTRACT(QUARTER FROM r.payment_date)
),

-- Fee collections from repayment schedule
fee_collections AS (
  SELECT
    rs.settled_date::date as analysis_date,
    EXTRACT(YEAR FROM rs.settled_date)::integer as year,
    EXTRACT(MONTH FROM rs.settled_date)::integer as month,
    EXTRACT(DAY FROM rs.settled_date)::integer as day,
    EXTRACT(WEEK FROM rs.settled_date)::integer as week,
    EXTRACT(QUARTER FROM rs.settled_date)::integer as quarter,
    br.branch_id,
    b.branch_name,
    b.branch_code,
    l.client__type as client_type,
    COALESCE(SUM(rs.received_documentation_fee), 0) as doc_fees_collected,
    COALESCE(SUM(rs.received_loan_risk_insurance), 0) as risk_insurance_collected,
    COALESCE(SUM(rs.received_gst_amount), 0) as gst_collected,
    COALESCE(SUM(rs.default_charged), 0) as default_fees_collected
  FROM repayment_schedule rs
  JOIN loans l ON l.loan_id = rs.loan_id
  LEFT JOIN borrowers br ON br.borrower_id = l.borrower_id
  LEFT JOIN branches b ON b.id = br.branch_id
  WHERE rs.settled_date IS NOT NULL
    AND rs.statusrs IN ('paid', 'partial')
  GROUP BY rs.settled_date::date, br.branch_id, b.branch_name, b.branch_code, l.client__type,
           EXTRACT(YEAR FROM rs.settled_date), EXTRACT(MONTH FROM rs.settled_date),
           EXTRACT(DAY FROM rs.settled_date), EXTRACT(WEEK FROM rs.settled_date),
           EXTRACT(QUARTER FROM rs.settled_date)
),

-- Active loans snapshot
active_loans_snapshot AS (
  SELECT
    CURRENT_DATE as analysis_date,
    EXTRACT(YEAR FROM CURRENT_DATE)::integer as year,
    EXTRACT(MONTH FROM CURRENT_DATE)::integer as month,
    EXTRACT(DAY FROM CURRENT_DATE)::integer as day,
    EXTRACT(WEEK FROM CURRENT_DATE)::integer as week,
    EXTRACT(QUARTER FROM CURRENT_DATE)::integer as quarter,
    br.branch_id,
    b.branch_name,
    b.branch_code,
    l.client__type as client_type,
    COUNT(CASE WHEN l.loan_status IN ('active', 'overdue') THEN 1 END) as active_loans_count,
    COUNT(CASE WHEN l.loan_status = 'settled' THEN 1 END) as settled_loans_count,
    COUNT(CASE WHEN l.loan_status = 'overdue' THEN 1 END) as overdue_loans_count,
    COALESCE(SUM(CASE WHEN l.loan_status IN ('active', 'overdue') THEN l.outstanding_balance ELSE 0 END), 0) as total_outstanding,
    COALESCE(SUM(CASE WHEN l.loan_status IN ('active', 'overdue') THEN l.arrears ELSE 0 END), 0) as total_arrears,
    COUNT(CASE WHEN l.loan_status IN ('active', 'overdue') AND l.arrears > 0 THEN 1 END) as at_risk_loans_count,
    COALESCE(SUM(CASE WHEN l.loan_status IN ('active', 'overdue') THEN l.missed_payments_count ELSE 0 END), 0) as total_missed_payments,
    COALESCE(SUM(CASE WHEN l.loan_status IN ('active', 'overdue') THEN l.partial_payments_count ELSE 0 END), 0) as total_partial_payments,
    COALESCE(SUM(CASE WHEN l.loan_status IN ('active', 'overdue') THEN l.default_fees_accumulated ELSE 0 END), 0) as total_default_fees
  FROM loans l
  LEFT JOIN borrowers br ON br.borrower_id = l.borrower_id
  LEFT JOIN branches b ON b.id = br.branch_id
  GROUP BY br.branch_id, b.branch_name, b.branch_code, l.client__type
),

-- Demographics from borrowers
demographics AS (
  SELECT
    br.branch_id,
    b.branch_name,
    b.branch_code,
    br.client_type,
    COUNT(CASE WHEN br.gender = 'Male' THEN 1 END) as male_count,
    COUNT(CASE WHEN br.gender = 'Female' THEN 1 END) as female_count,
    COUNT(CASE WHEN br.client_type = 'Public Service' THEN 1 END) as public_service_count,
    COUNT(CASE WHEN br.client_type = 'Statutory Body' THEN 1 END) as statutory_body_count,
    COUNT(CASE WHEN br.client_type = 'Private Company' THEN 1 END) as private_company_count
  FROM borrowers br
  LEFT JOIN branches b ON b.id = br.branch_id
  GROUP BY br.branch_id, b.branch_name, b.branch_code, br.client_type
)

-- Combine all CTEs
SELECT
  COALESCE(dp.analysis_date, lr.analysis_date, rd.analysis_date, rc.analysis_date, fc.analysis_date, als.analysis_date) as analysis_date,
  COALESCE(dp.year, lr.year, rd.year, rc.year, fc.year, als.year) as year,
  COALESCE(dp.month, lr.month, rd.month, rc.month, fc.month, als.month) as month,
  COALESCE(dp.day, lr.day, rd.day, rc.day, fc.day, als.day) as day,
  COALESCE(dp.week, lr.week, rd.week, rc.week, fc.week, als.week) as week,
  COALESCE(dp.quarter, lr.quarter, rd.quarter, rc.quarter, fc.quarter, als.quarter) as quarter,
  COALESCE(dp.branch_id, lr.branch_id, rd.branch_id, rc.branch_id, fc.branch_id, als.branch_id, dem.branch_id) as branch_id,
  COALESCE(dp.branch_name, lr.branch_name, rd.branch_name, rc.branch_name, fc.branch_name, als.branch_name, dem.branch_name) as branch_name,
  COALESCE(dp.branch_code, lr.branch_code, rd.branch_code, rc.branch_code, fc.branch_code, als.branch_code, dem.branch_code) as branch_code,
  COALESCE(dp.client_type, lr.client_type, rd.client_type, rc.client_type, fc.client_type, als.client_type, dem.client_type) as client_type,
  dp.payroll_type,
  
  -- Loans released
  COALESCE(lr.loans_released_count, 0) as loans_released_count,
  COALESCE(lr.principal_released, 0) as principal_released,
  COALESCE(lr.total_loan_amount, 0) as total_loan_amount,
  
  -- Repayments due (FORECAST from active loans)
  COALESCE(rd.repayments_due_count, 0) as repayments_due_count,
  COALESCE(rd.total_due_amount, 0) as total_due_amount,
  COALESCE(rd.principal_due, 0) as principal_due,
  COALESCE(rd.interest_due, 0) as interest_due,
  COALESCE(rd.doc_fees_due, 0) as doc_fees_due,
  COALESCE(rd.risk_insurance_due, 0) as risk_insurance_due,
  COALESCE(rd.gst_due, 0) as gst_due,
  COALESCE(rd.pending_schedules, 0) as pending_schedules,
  COALESCE(rd.paid_schedules, 0) as paid_schedules,
  COALESCE(rd.partial_schedules, 0) as partial_schedules,
  COALESCE(rd.defaulted_schedules, 0) as defaulted_schedules,
  
  -- Collections (ACTUAL)
  COALESCE(rc.repayments_collected_count, 0) as repayments_collected_count,
  COALESCE(rc.total_collections, 0) as total_collections,
  
  -- Fee collections
  COALESCE(fc.doc_fees_collected, 0) as doc_fees_collected,
  COALESCE(fc.risk_insurance_collected, 0) as risk_insurance_collected,
  COALESCE(fc.gst_collected, 0) as gst_collected,
  COALESCE(fc.default_fees_collected, 0) as default_fees_collected,
  
  -- Active loans snapshot
  COALESCE(als.active_loans_count, 0) as active_loans_count,
  COALESCE(als.settled_loans_count, 0) as settled_loans_count,
  COALESCE(als.overdue_loans_count, 0) as overdue_loans_count,
  COALESCE(als.total_outstanding, 0) as total_outstanding,
  COALESCE(als.total_arrears, 0) as total_arrears,
  COALESCE(als.at_risk_loans_count, 0) as at_risk_loans_count,
  COALESCE(als.total_missed_payments, 0) as total_missed_payments,
  COALESCE(als.total_partial_payments, 0) as total_partial_payments,
  COALESCE(als.total_default_fees, 0) as total_default_fees,
  
  -- Demographics
  COALESCE(dem.male_count, 0) as male_count,
  COALESCE(dem.female_count, 0) as female_count,
  COALESCE(dem.public_service_count, 0) as public_service_count,
  COALESCE(dem.statutory_body_count, 0) as statutory_body_count,
  COALESCE(dem.private_company_count, 0) as private_company_count,
  
  -- Calculated metrics
  COALESCE(rd.total_due_amount - rc.total_collections, rd.total_due_amount, -rc.total_collections, 0) as pending_collections,
  CASE 
    WHEN COALESCE(rd.total_due_amount, 0) > 0 
    THEN (COALESCE(rc.total_collections, 0) / rd.total_due_amount * 100)
    ELSE 0 
  END as collection_efficiency_percentage,
  
  -- Placeholder fields to match existing structure
  0::bigint as defaults_count,
  0::numeric as total_default_amount,
  0::bigint as public_defaults,
  0::bigint as statutory_defaults,
  0::bigint as private_defaults,
  0::numeric as public_default_amount,
  0::numeric as statutory_default_amount,
  0::numeric as private_default_amount,
  0::bigint as new_borrowers_count,
  0::bigint as new_male_borrowers,
  0::bigint as new_female_borrowers,
  0::bigint as new_public_service,
  0::bigint as new_statutory_body,
  0::bigint as new_private_company,
  0::bigint as total_applications,
  0::bigint as pending_applications_count,
  0::bigint as approved_applications_count,
  0::bigint as declined_applications_count,
  0::numeric as avg_completion_percentage,
  0::integer as avg_loan_duration_days

FROM date_periods dp
FULL OUTER JOIN loans_released lr 
  ON dp.analysis_date = lr.analysis_date 
  AND COALESCE(dp.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(lr.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(dp.client_type, '') = COALESCE(lr.client_type, '')
FULL OUTER JOIN repayments_due rd 
  ON dp.analysis_date = rd.analysis_date 
  AND COALESCE(dp.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(rd.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(dp.client_type, '') = COALESCE(rd.client_type, '')
  AND COALESCE(dp.payroll_type, '') = COALESCE(rd.payroll_type, '')
FULL OUTER JOIN repayments_collected rc 
  ON dp.analysis_date = rc.analysis_date 
  AND COALESCE(dp.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(rc.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(dp.client_type, '') = COALESCE(rc.client_type, '')
FULL OUTER JOIN fee_collections fc 
  ON dp.analysis_date = fc.analysis_date 
  AND COALESCE(dp.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(fc.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(dp.client_type, '') = COALESCE(fc.client_type, '')
FULL OUTER JOIN active_loans_snapshot als 
  ON COALESCE(dp.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(als.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(dp.client_type, '') = COALESCE(als.client_type, '')
FULL OUTER JOIN demographics dem 
  ON COALESCE(dp.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(dem.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND COALESCE(dp.client_type, '') = COALESCE(dem.client_type, '');