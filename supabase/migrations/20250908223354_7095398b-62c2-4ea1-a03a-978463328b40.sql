-- Drop existing dashboard views
DROP VIEW IF EXISTS dashboard_analytics_view CASCADE;
DROP VIEW IF EXISTS dashboard_metrics_view CASCADE;
DROP VIEW IF EXISTS dashboard_comprehensive_view CASCADE;

-- Create comprehensive dashboard view with branch information
CREATE VIEW dashboard_analytics_with_branches AS
WITH date_series AS (
  SELECT 
    generate_series(
      '2024-01-01'::date,
      CURRENT_DATE,
      '1 day'::interval
    )::date AS analysis_date
),

-- Borrower information with branch details
borrower_info AS (
  SELECT 
    b.borrower_id,
    b.given_name,
    b.surname,
    b.given_name || ' ' || b.surname AS full_name,
    b.email,
    b.mobile_number,
    b.gender,
    b.department_company,
    b.position,
    b.file_number,
    b.branch_id,
    br.branch_name,
    br.branch_code,
    br.city as branch_city,
    br.state_province as branch_state,
    -- Client type categorization
    CASE 
      WHEN LOWER(COALESCE(b.department_company, '')) LIKE '%public%' 
        OR LOWER(COALESCE(b.department_company, '')) LIKE '%government%' 
        OR LOWER(COALESCE(b.department_company, '')) LIKE '%ministry%'
        OR LOWER(COALESCE(b.department_company, '')) LIKE '%department%'
        THEN 'Public Service'
      WHEN LOWER(COALESCE(b.department_company, '')) LIKE '%statutory%' 
        OR LOWER(COALESCE(b.department_company, '')) LIKE '%authority%'
        OR LOWER(COALESCE(b.department_company, '')) LIKE '%commission%'
        OR LOWER(COALESCE(b.department_company, '')) LIKE '%board%'
        THEN 'Statutory Bodies'
      ELSE 'Private Companies'
    END AS client_type,
    -- Extract creation date
    CASE 
      WHEN b.date_employed IS NOT NULL THEN b.date_employed
      ELSE '2024-01-01'::date
    END AS borrower_created_date
  FROM borrowers b
  LEFT JOIN branches br ON b.branch_id = br.id
),

-- Loan information with branch details
loan_info AS (
  SELECT 
    l.*,
    bi.full_name as borrower_name,
    bi.email as borrower_email,
    bi.mobile_number as borrower_mobile,
    bi.gender as borrower_gender,
    bi.client_type,
    bi.branch_id,
    bi.branch_name,
    bi.branch_code,
    bi.branch_city,
    bi.branch_state,
    -- Loan status calculations
    CASE 
      WHEN l.loan_status = 'settled' THEN 'settled'
      WHEN l.outstanding_balance > 0 AND CURRENT_DATE > l.maturity_date THEN 'overdue'
      WHEN l.outstanding_balance > 0 AND l.loan_repayment_status = 'default' THEN 'at_risk'
      WHEN l.outstanding_balance > 0 THEN 'active'
      ELSE 'settled'
    END AS current_loan_status
  FROM loans l
  INNER JOIN borrower_info bi ON l.borrower_id = bi.borrower_id
),

-- Daily loan disbursements
daily_disbursements AS (
  SELECT 
    li.disbursement_date as analysis_date,
    li.branch_id,
    li.branch_name,
    li.branch_code,
    li.client_type,
    COUNT(*) as loans_released_count,
    SUM(li.principal) as principal_released,
    SUM(li.gross_loan) as total_loan_amount,
    COUNT(*) FILTER (WHERE li.current_loan_status = 'active') as active_loans_count,
    COUNT(*) FILTER (WHERE li.current_loan_status = 'settled') as settled_loans_count,
    COUNT(*) FILTER (WHERE li.current_loan_status = 'at_risk') as at_risk_loans_count,
    COUNT(*) FILTER (WHERE li.current_loan_status = 'overdue') as overdue_loans_count,
    SUM(li.outstanding_balance) FILTER (WHERE li.current_loan_status IN ('active', 'at_risk', 'overdue')) as total_outstanding,
    SUM(li.arrears) FILTER (WHERE li.arrears > 0) as total_arrears,
    SUM(li.default_fees_accumulated) as total_default_fees,
    SUM(li.missed_payments_count) as total_missed_payments,
    SUM(li.partial_payments_count) as total_partial_payments,
    AVG(li.repayment_completion_percentage) as avg_completion_percentage,
    -- Gender distribution
    COUNT(*) FILTER (WHERE li.borrower_gender = 'Male') as male_count,
    COUNT(*) FILTER (WHERE li.borrower_gender = 'Female') as female_count,
    -- Client type distribution
    COUNT(*) FILTER (WHERE li.client_type = 'Public Service') as public_service_count,
    COUNT(*) FILTER (WHERE li.client_type = 'Statutory Bodies') as statutory_body_count,
    COUNT(*) FILTER (WHERE li.client_type = 'Private Companies') as private_company_count
  FROM loan_info li
  WHERE li.disbursement_date IS NOT NULL
  GROUP BY li.disbursement_date, li.branch_id, li.branch_name, li.branch_code, li.client_type
),

-- Daily repayment collections
daily_collections AS (
  SELECT 
    r.payment_date as analysis_date,
    li.branch_id,
    li.branch_name,
    li.branch_code,
    li.client_type,
    COUNT(*) as repayments_collected_count,
    SUM(r.amount) FILTER (WHERE r.verification_status = 'approved') as total_collections,
    SUM(r.amount) FILTER (WHERE r.verification_status = 'pending') as pending_collections,
    -- Fee breakdown from repayment schedule
    SUM(rs.received_interest) as interest_collected,
    SUM(rs.received_documentation_fee) as doc_fees_collected,
    SUM(rs.received_loan_risk_insurance) as risk_insurance_collected,
    SUM(rs.received_gst_amount) as gst_collected
  FROM repayments r
  INNER JOIN loan_info li ON r.loan_id = li.loan_id
  LEFT JOIN repayment_schedule rs ON r.loan_id = rs.loan_id AND r.payment_date = rs.due_date
  WHERE r.payment_date IS NOT NULL
  GROUP BY r.payment_date, li.branch_id, li.branch_name, li.branch_code, li.client_type
),

-- Daily scheduled amounts
daily_scheduled AS (
  SELECT 
    rs.due_date as analysis_date,
    li.branch_id,
    li.branch_name,
    li.branch_code,
    li.client_type,
    rs.payroll_type,
    COUNT(*) as repayments_due_count,
    SUM(rs.repaymentrs) as total_due_amount,
    SUM(rs.principalrs) as principal_due,
    SUM(rs.interestrs) as interest_due,
    SUM(rs.documentation_feers) as doc_fees_due,
    SUM(rs.loan_risk_insurancers) as risk_insurance_due,
    SUM(rs.gst_amountrs) as gst_due,
    -- Status breakdown
    COUNT(*) FILTER (WHERE rs.statusrs = 'pending') as pending_schedules,
    COUNT(*) FILTER (WHERE rs.statusrs = 'paid') as paid_schedules,
    COUNT(*) FILTER (WHERE rs.statusrs = 'partial') as partial_schedules,
    COUNT(*) FILTER (WHERE rs.statusrs = 'default') as defaulted_schedules
  FROM repayment_schedule rs
  INNER JOIN loan_info li ON rs.loan_id = li.loan_id
  WHERE rs.due_date IS NOT NULL
  GROUP BY rs.due_date, li.branch_id, li.branch_name, li.branch_code, li.client_type, rs.payroll_type
),

-- Daily defaults
daily_defaults AS (
  SELECT 
    d.date as analysis_date,
    li.branch_id,
    li.branch_name,
    li.branch_code,
    li.client_type,
    COUNT(*) as defaults_count,
    SUM(d.default_amount) as total_default_amount,
    -- Default breakdown by client type
    COUNT(*) FILTER (WHERE li.client_type = 'Public Service') as public_defaults,
    COUNT(*) FILTER (WHERE li.client_type = 'Statutory Bodies') as statutory_defaults,
    COUNT(*) FILTER (WHERE li.client_type = 'Private Companies') as private_defaults,
    SUM(d.default_amount) FILTER (WHERE li.client_type = 'Public Service') as public_default_amount,
    SUM(d.default_amount) FILTER (WHERE li.client_type = 'Statutory Bodies') as statutory_default_amount,
    SUM(d.default_amount) FILTER (WHERE li.client_type = 'Private Companies') as private_default_amount
  FROM defaults d
  INNER JOIN repayment_schedule rs ON d.schedule_id = rs.schedule_id
  INNER JOIN loan_info li ON rs.loan_id = li.loan_id
  WHERE d.date IS NOT NULL AND d.status = 'active'
  GROUP BY d.date, li.branch_id, li.branch_name, li.branch_code, li.client_type
),

-- Daily new borrowers
daily_new_borrowers AS (
  SELECT 
    bi.borrower_created_date as analysis_date,
    bi.branch_id,
    bi.branch_name,
    bi.branch_code,
    COUNT(*) as new_borrowers_count,
    COUNT(*) FILTER (WHERE bi.gender = 'Male') as new_male_borrowers,
    COUNT(*) FILTER (WHERE bi.gender = 'Female') as new_female_borrowers,
    COUNT(*) FILTER (WHERE bi.client_type = 'Public Service') as new_public_service,
    COUNT(*) FILTER (WHERE bi.client_type = 'Statutory Bodies') as new_statutory_body,
    COUNT(*) FILTER (WHERE bi.client_type = 'Private Companies') as new_private_company
  FROM borrower_info bi
  GROUP BY bi.borrower_created_date, bi.branch_id, bi.branch_name, bi.branch_code
),

-- Daily applications
daily_applications AS (
  SELECT 
    COALESCE(a.uploaded_at::date, CURRENT_DATE) as analysis_date,
    -- For now, we'll use a default branch since applications don't have branch info
    '00000000-0000-0000-0000-000000000000'::uuid as branch_id,
    'All Branches' as branch_name,
    'ALL' as branch_code,
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE a.status = 'pending') as pending_applications_count,
    COUNT(*) FILTER (WHERE a.status = 'approved') as approved_applications_count,
    COUNT(*) FILTER (WHERE a.status = 'declined') as declined_applications_count
  FROM applications a
  WHERE a.uploaded_at IS NOT NULL
  GROUP BY a.uploaded_at::date
)

-- Main comprehensive view
SELECT 
  ds.analysis_date,
  -- Time period breakdowns
  EXTRACT(year FROM ds.analysis_date)::integer as year,
  EXTRACT(month FROM ds.analysis_date)::integer as month,
  EXTRACT(day FROM ds.analysis_date)::integer as day,
  EXTRACT(week FROM ds.analysis_date)::integer as week,
  EXTRACT(quarter FROM ds.analysis_date)::integer as quarter,
  
  -- Branch information
  COALESCE(dd.branch_id, dc.branch_id, ds_sched.branch_id, ddef.branch_id, dnb.branch_id, da.branch_id) as branch_id,
  COALESCE(dd.branch_name, dc.branch_name, ds_sched.branch_name, ddef.branch_name, dnb.branch_name, da.branch_name, 'Unknown Branch') as branch_name,
  COALESCE(dd.branch_code, dc.branch_code, ds_sched.branch_code, ddef.branch_code, dnb.branch_code, da.branch_code, 'UNK') as branch_code,
  
  -- Client type
  COALESCE(dd.client_type, dc.client_type, ds_sched.client_type, ddef.client_type, 'All Types') as client_type,
  
  -- Payroll type (from scheduled data)
  ds_sched.payroll_type,
  
  -- Loan disbursement metrics
  COALESCE(dd.loans_released_count, 0) as loans_released_count,
  COALESCE(dd.principal_released, 0) as principal_released,
  COALESCE(dd.total_loan_amount, 0) as total_loan_amount,
  
  -- Collection metrics
  COALESCE(dc.total_collections, 0) as total_collections,
  COALESCE(dc.repayments_collected_count, 0) as repayments_collected_count,
  COALESCE(dc.pending_collections, 0) as pending_collections,
  COALESCE(dc.interest_collected, 0) as interest_collected,
  COALESCE(dc.doc_fees_collected, 0) as doc_fees_collected,
  COALESCE(dc.risk_insurance_collected, 0) as risk_insurance_collected,
  COALESCE(dc.gst_collected, 0) as gst_collected,
  
  -- Schedule metrics
  COALESCE(ds_sched.total_due_amount, 0) as total_due_amount,
  COALESCE(ds_sched.repayments_due_count, 0) as repayments_due_count,
  COALESCE(ds_sched.principal_due, 0) as principal_due,
  COALESCE(ds_sched.interest_due, 0) as interest_due,
  COALESCE(ds_sched.doc_fees_due, 0) as doc_fees_due,
  COALESCE(ds_sched.risk_insurance_due, 0) as risk_insurance_due,
  COALESCE(ds_sched.gst_due, 0) as gst_due,
  COALESCE(ds_sched.pending_schedules, 0) as pending_schedules,
  COALESCE(ds_sched.paid_schedules, 0) as paid_schedules,
  COALESCE(ds_sched.partial_schedules, 0) as partial_schedules,
  COALESCE(ds_sched.defaulted_schedules, 0) as defaulted_schedules,
  
  -- Portfolio metrics (cumulative)
  COALESCE(dd.active_loans_count, 0) as active_loans_count,
  COALESCE(dd.settled_loans_count, 0) as settled_loans_count,
  COALESCE(dd.at_risk_loans_count, 0) as at_risk_loans_count,
  COALESCE(dd.overdue_loans_count, 0) as overdue_loans_count,
  COALESCE(dd.total_outstanding, 0) as total_outstanding,
  COALESCE(dd.total_arrears, 0) as total_arrears,
  COALESCE(dd.total_default_fees, 0) as total_default_fees,
  COALESCE(dd.total_missed_payments, 0) as total_missed_payments,
  COALESCE(dd.total_partial_payments, 0) as total_partial_payments,
  COALESCE(dd.avg_completion_percentage, 0) as avg_completion_percentage,
  
  -- Default metrics
  COALESCE(ddef.defaults_count, 0) as defaults_count,
  COALESCE(ddef.total_default_amount, 0) as total_default_amount,
  COALESCE(ddef.public_defaults, 0) as public_defaults,
  COALESCE(ddef.statutory_defaults, 0) as statutory_defaults,
  COALESCE(ddef.private_defaults, 0) as private_defaults,
  COALESCE(ddef.public_default_amount, 0) as public_default_amount,
  COALESCE(ddef.statutory_default_amount, 0) as statutory_default_amount,
  COALESCE(ddef.private_default_amount, 0) as private_default_amount,
  
  -- Borrower metrics
  COALESCE(dnb.new_borrowers_count, 0) as new_borrowers_count,
  COALESCE(dnb.new_male_borrowers, 0) as new_male_borrowers,
  COALESCE(dnb.new_female_borrowers, 0) as new_female_borrowers,
  COALESCE(dnb.new_public_service, 0) as new_public_service,
  COALESCE(dnb.new_statutory_body, 0) as new_statutory_body,
  COALESCE(dnb.new_private_company, 0) as new_private_company,
  
  -- Gender distribution (from loans)
  COALESCE(dd.male_count, 0) as male_count,
  COALESCE(dd.female_count, 0) as female_count,
  
  -- Client type distribution (from loans)
  COALESCE(dd.public_service_count, 0) as public_service_count,
  COALESCE(dd.statutory_body_count, 0) as statutory_body_count,
  COALESCE(dd.private_company_count, 0) as private_company_count,
  
  -- Application metrics
  COALESCE(da.total_applications, 0) as total_applications,
  COALESCE(da.pending_applications_count, 0) as pending_applications_count,
  COALESCE(da.approved_applications_count, 0) as approved_applications_count,
  COALESCE(da.declined_applications_count, 0) as declined_applications_count,
  
  -- Collection efficiency
  CASE 
    WHEN COALESCE(ds_sched.total_due_amount, 0) = 0 THEN 0
    ELSE (COALESCE(dc.total_collections, 0) / COALESCE(ds_sched.total_due_amount, 1)) * 100
  END as collection_efficiency_percentage,
  
  -- Average loan duration (calculated from active loans only)
  CASE 
    WHEN COALESCE(dd.active_loans_count, 0) = 0 THEN 0
    ELSE 180 -- Default estimation, could be enhanced with actual duration calculation
  END as avg_loan_duration_days

FROM date_series ds
LEFT JOIN daily_disbursements dd ON ds.analysis_date = dd.analysis_date
LEFT JOIN daily_collections dc ON ds.analysis_date = dc.analysis_date 
  AND COALESCE(dd.branch_id, '00000000-0000-0000-0000-000000000000') = COALESCE(dc.branch_id, '00000000-0000-0000-0000-000000000000')
  AND COALESCE(dd.client_type, 'All Types') = COALESCE(dc.client_type, 'All Types')
LEFT JOIN daily_scheduled ds_sched ON ds.analysis_date = ds_sched.analysis_date 
  AND COALESCE(dd.branch_id, COALESCE(dc.branch_id, '00000000-0000-0000-0000-000000000000')) = COALESCE(ds_sched.branch_id, '00000000-0000-0000-0000-000000000000')
  AND COALESCE(dd.client_type, COALESCE(dc.client_type, 'All Types')) = COALESCE(ds_sched.client_type, 'All Types')
LEFT JOIN daily_defaults ddef ON ds.analysis_date = ddef.analysis_date 
  AND COALESCE(dd.branch_id, COALESCE(dc.branch_id, COALESCE(ds_sched.branch_id, '00000000-0000-0000-0000-000000000000'))) = COALESCE(ddef.branch_id, '00000000-0000-0000-0000-000000000000')
  AND COALESCE(dd.client_type, COALESCE(dc.client_type, COALESCE(ds_sched.client_type, 'All Types'))) = COALESCE(ddef.client_type, 'All Types')
LEFT JOIN daily_new_borrowers dnb ON ds.analysis_date = dnb.analysis_date 
  AND COALESCE(dd.branch_id, COALESCE(dc.branch_id, COALESCE(ds_sched.branch_id, COALESCE(ddef.branch_id, '00000000-0000-0000-0000-000000000000')))) = COALESCE(dnb.branch_id, '00000000-0000-0000-0000-000000000000')
LEFT JOIN daily_applications da ON ds.analysis_date = da.analysis_date

WHERE ds.analysis_date >= '2024-01-01'
  AND (
    dd.loans_released_count > 0 
    OR dc.total_collections > 0 
    OR ds_sched.total_due_amount > 0 
    OR ddef.defaults_count > 0 
    OR dnb.new_borrowers_count > 0 
    OR da.total_applications > 0
  )

ORDER BY ds.analysis_date DESC, branch_name, client_type;