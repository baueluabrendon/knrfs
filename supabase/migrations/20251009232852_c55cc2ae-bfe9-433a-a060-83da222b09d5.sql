-- Fix the dashboard_analytics_with_branches view to correctly calculate principal_released
-- The issue: it was multiplying principal by loan term instead of just summing principal

DROP VIEW IF EXISTS dashboard_analytics_with_branches CASCADE;

CREATE VIEW dashboard_analytics_with_branches AS
WITH loan_data AS (
  SELECT
    l.loan_id,
    l.principal,
    l.gross_loan,
    l.disbursement_date,
    l.loan_status,
    l.outstanding_balance,
    l.arrears,
    l.default_fees_accumulated,
    l.missed_payments_count,
    l.partial_payments_count,
    l.borrower_id,
    b.branch_id,
    b.gender,
    b.client_type,
    br.branch_name,
    br.branch_code,
    EXTRACT(YEAR FROM l.disbursement_date) as year,
    EXTRACT(MONTH FROM l.disbursement_date) as month,
    EXTRACT(DAY FROM l.disbursement_date) as day,
    EXTRACT(WEEK FROM l.disbursement_date) as week,
    EXTRACT(QUARTER FROM l.disbursement_date) as quarter,
    l.disbursement_date as analysis_date
  FROM loans l
  LEFT JOIN borrowers b ON l.borrower_id = b.borrower_id
  LEFT JOIN branches br ON b.branch_id = br.id
),
repayment_data AS (
  SELECT
    rs.loan_id,
    rs.due_date,
    rs.payroll_type,
    rs.repaymentrs,
    rs.repayment_received,
    rs.statusrs,
    rs.principalrs,
    rs.interestrs,
    rs.documentation_feers,
    rs.loan_risk_insurancers,
    rs.gst_amountrs,
    rs.default_charged,
    EXTRACT(YEAR FROM rs.due_date) as year,
    EXTRACT(MONTH FROM rs.due_date) as month,
    EXTRACT(DAY FROM rs.due_date) as day
  FROM repayment_schedule rs
),
aggregated_metrics AS (
  SELECT
    ld.year,
    ld.month,
    ld.day,
    ld.week,
    ld.quarter,
    ld.analysis_date,
    ld.branch_id,
    ld.branch_name,
    ld.branch_code,
    ld.client_type,
    NULL::text as payroll_type,
    
    -- Loan releases (correctly sum principal, not multiply)
    COUNT(DISTINCT ld.loan_id) as loans_released_count,
    SUM(ld.principal) as principal_released,
    SUM(ld.gross_loan) as total_loan_amount,
    
    -- Active loans count
    COUNT(DISTINCT CASE WHEN ld.loan_status = 'active' THEN ld.loan_id END) as active_loans_count,
    COUNT(DISTINCT CASE WHEN ld.loan_status = 'settled' THEN ld.loan_id END) as settled_loans_count,
    COUNT(DISTINCT CASE WHEN ld.loan_status = 'overdue' THEN ld.loan_id END) as overdue_loans_count,
    
    -- Financial metrics
    SUM(CASE WHEN ld.loan_status = 'active' THEN ld.outstanding_balance ELSE 0 END) as total_outstanding,
    SUM(ld.arrears) as total_arrears,
    SUM(ld.default_fees_accumulated) as total_default_fees,
    
    -- Risk metrics
    COUNT(DISTINCT CASE WHEN ld.arrears > 0 THEN ld.loan_id END) as at_risk_loans_count,
    SUM(ld.missed_payments_count) as total_missed_payments,
    SUM(ld.partial_payments_count) as total_partial_payments,
    
    -- Demographics
    COUNT(DISTINCT CASE WHEN ld.gender = 'Male' THEN ld.borrower_id END) as male_count,
    COUNT(DISTINCT CASE WHEN ld.gender = 'Female' THEN ld.borrower_id END) as female_count,
    COUNT(DISTINCT CASE WHEN ld.client_type = 'Public Service' THEN ld.borrower_id END) as public_service_count,
    COUNT(DISTINCT CASE WHEN ld.client_type = 'Statutory Body' THEN ld.borrower_id END) as statutory_body_count,
    COUNT(DISTINCT CASE WHEN ld.client_type = 'Private Company' THEN ld.borrower_id END) as private_company_count,
    
    -- New borrowers
    COUNT(DISTINCT ld.borrower_id) as new_borrowers_count,
    COUNT(DISTINCT CASE WHEN ld.gender = 'Male' THEN ld.borrower_id END) as new_male_borrowers,
    COUNT(DISTINCT CASE WHEN ld.gender = 'Female' THEN ld.borrower_id END) as new_female_borrowers,
    COUNT(DISTINCT CASE WHEN ld.client_type = 'Public Service' THEN ld.borrower_id END) as new_public_service,
    COUNT(DISTINCT CASE WHEN ld.client_type = 'Statutory Body' THEN ld.borrower_id END) as new_statutory_body,
    COUNT(DISTINCT CASE WHEN ld.client_type = 'Private Company' THEN ld.borrower_id END) as new_private_company,
    
    -- Placeholder metrics (will be aggregated from repayment_data)
    0::bigint as repayments_collected_count,
    0::numeric as total_collections,
    0::numeric as doc_fees_collected,
    0::numeric as risk_insurance_collected,
    0::numeric as gst_collected,
    0::numeric as default_fees_collected,
    0::bigint as repayments_due_count,
    0::numeric as total_due_amount,
    0::numeric as principal_due,
    0::numeric as interest_due,
    0::numeric as doc_fees_due,
    0::numeric as risk_insurance_due,
    0::numeric as gst_due,
    0::bigint as pending_schedules,
    0::bigint as paid_schedules,
    0::bigint as partial_schedules,
    0::bigint as defaulted_schedules,
    0::numeric as pending_collections,
    0::bigint as defaults_count,
    0::numeric as total_default_amount,
    0::bigint as public_defaults,
    0::bigint as statutory_defaults,
    0::bigint as private_defaults,
    0::numeric as public_default_amount,
    0::numeric as statutory_default_amount,
    0::numeric as private_default_amount,
    0::integer as avg_loan_duration_days,
    0::numeric as collection_efficiency_percentage,
    0::numeric as avg_completion_percentage,
    0::bigint as total_applications,
    0::bigint as pending_applications_count,
    0::bigint as approved_applications_count,
    0::bigint as declined_applications_count
  FROM loan_data ld
  GROUP BY 
    ld.year, ld.month, ld.day, ld.week, ld.quarter, ld.analysis_date,
    ld.branch_id, ld.branch_name, ld.branch_code, ld.client_type
    
  UNION ALL
  
  SELECT
    rd.year,
    rd.month,
    rd.day,
    EXTRACT(WEEK FROM rd.due_date)::integer as week,
    EXTRACT(QUARTER FROM rd.due_date)::integer as quarter,
    rd.due_date as analysis_date,
    b.branch_id,
    br.branch_name,
    br.branch_code,
    b.client_type,
    rd.payroll_type,
    
    -- Loan release metrics (0 for repayment records)
    0::bigint as loans_released_count,
    0::numeric as principal_released,
    0::numeric as total_loan_amount,
    0::bigint as active_loans_count,
    0::bigint as settled_loans_count,
    0::bigint as overdue_loans_count,
    0::numeric as total_outstanding,
    0::numeric as total_arrears,
    0::numeric as total_default_fees,
    0::bigint as at_risk_loans_count,
    0::bigint as total_missed_payments,
    0::bigint as total_partial_payments,
    0::bigint as male_count,
    0::bigint as female_count,
    0::bigint as public_service_count,
    0::bigint as statutory_body_count,
    0::bigint as private_company_count,
    0::bigint as new_borrowers_count,
    0::bigint as new_male_borrowers,
    0::bigint as new_female_borrowers,
    0::bigint as new_public_service,
    0::bigint as new_statutory_body,
    0::bigint as new_private_company,
    
    -- Repayment/collection metrics
    COUNT(*) FILTER (WHERE rd.repayment_received > 0) as repayments_collected_count,
    SUM(COALESCE(rd.repayment_received, 0)) as total_collections,
    SUM(COALESCE(rd.documentation_feers, 0)) as doc_fees_collected,
    SUM(COALESCE(rd.loan_risk_insurancers, 0)) as risk_insurance_collected,
    SUM(COALESCE(rd.gst_amountrs, 0)) as gst_collected,
    SUM(COALESCE(rd.default_charged, 0)) as default_fees_collected,
    
    -- Due amounts (for current and future schedules)
    COUNT(*) as repayments_due_count,
    SUM(rd.repaymentrs) as total_due_amount,
    SUM(rd.principalrs) as principal_due,
    SUM(rd.interestrs) as interest_due,
    SUM(rd.documentation_feers) as doc_fees_due,
    SUM(rd.loan_risk_insurancers) as risk_insurance_due,
    SUM(rd.gst_amountrs) as gst_due,
    
    -- Schedule status counts
    COUNT(*) FILTER (WHERE rd.statusrs = 'pending') as pending_schedules,
    COUNT(*) FILTER (WHERE rd.statusrs = 'paid') as paid_schedules,
    COUNT(*) FILTER (WHERE rd.statusrs = 'partial') as partial_schedules,
    COUNT(*) FILTER (WHERE rd.statusrs = 'default') as defaulted_schedules,
    
    SUM(CASE WHEN rd.statusrs = 'pending' THEN rd.repaymentrs ELSE 0 END) as pending_collections,
    
    -- Default metrics
    COUNT(DISTINCT d.arrear_id) as defaults_count,
    SUM(d.default_amount) as total_default_amount,
    COUNT(DISTINCT CASE WHEN b.client_type = 'Public Service' THEN d.arrear_id END) as public_defaults,
    COUNT(DISTINCT CASE WHEN b.client_type = 'Statutory Body' THEN d.arrear_id END) as statutory_defaults,
    COUNT(DISTINCT CASE WHEN b.client_type = 'Private Company' THEN d.arrear_id END) as private_defaults,
    SUM(CASE WHEN b.client_type = 'Public Service' THEN d.default_amount ELSE 0 END) as public_default_amount,
    SUM(CASE WHEN b.client_type = 'Statutory Body' THEN d.default_amount ELSE 0 END) as statutory_default_amount,
    SUM(CASE WHEN b.client_type = 'Private Company' THEN d.default_amount ELSE 0 END) as private_default_amount,
    
    0::integer as avg_loan_duration_days,
    0::numeric as collection_efficiency_percentage,
    0::numeric as avg_completion_percentage,
    0::bigint as total_applications,
    0::bigint as pending_applications_count,
    0::bigint as approved_applications_count,
    0::bigint as declined_applications_count
  FROM repayment_data rd
  LEFT JOIN loans l ON rd.loan_id = l.loan_id
  LEFT JOIN borrowers b ON l.borrower_id = b.borrower_id
  LEFT JOIN branches br ON b.branch_id = br.id
  LEFT JOIN defaults d ON rd.loan_id = l.loan_id
  GROUP BY 
    rd.year, rd.month, rd.day, rd.due_date, rd.payroll_type,
    b.branch_id, br.branch_name, br.branch_code, b.client_type
)
SELECT
  year,
  month,
  day,
  week,
  quarter,
  analysis_date,
  branch_id,
  branch_name,
  branch_code,
  client_type,
  payroll_type,
  SUM(loans_released_count) as loans_released_count,
  SUM(principal_released) as principal_released,
  SUM(total_loan_amount) as total_loan_amount,
  SUM(active_loans_count) as active_loans_count,
  SUM(settled_loans_count) as settled_loans_count,
  SUM(overdue_loans_count) as overdue_loans_count,
  SUM(total_outstanding) as total_outstanding,
  SUM(total_arrears) as total_arrears,
  SUM(total_default_fees) as total_default_fees,
  SUM(at_risk_loans_count) as at_risk_loans_count,
  SUM(total_missed_payments) as total_missed_payments,
  SUM(total_partial_payments) as total_partial_payments,
  SUM(male_count) as male_count,
  SUM(female_count) as female_count,
  SUM(public_service_count) as public_service_count,
  SUM(statutory_body_count) as statutory_body_count,
  SUM(private_company_count) as private_company_count,
  SUM(new_borrowers_count) as new_borrowers_count,
  SUM(new_male_borrowers) as new_male_borrowers,
  SUM(new_female_borrowers) as new_female_borrowers,
  SUM(new_public_service) as new_public_service,
  SUM(new_statutory_body) as new_statutory_body,
  SUM(new_private_company) as new_private_company,
  SUM(repayments_collected_count) as repayments_collected_count,
  SUM(total_collections) as total_collections,
  SUM(doc_fees_collected) as doc_fees_collected,
  SUM(risk_insurance_collected) as risk_insurance_collected,
  SUM(gst_collected) as gst_collected,
  SUM(default_fees_collected) as default_fees_collected,
  SUM(repayments_due_count) as repayments_due_count,
  SUM(total_due_amount) as total_due_amount,
  SUM(principal_due) as principal_due,
  SUM(interest_due) as interest_due,
  SUM(doc_fees_due) as doc_fees_due,
  SUM(risk_insurance_due) as risk_insurance_due,
  SUM(gst_due) as gst_due,
  SUM(pending_schedules) as pending_schedules,
  SUM(paid_schedules) as paid_schedules,
  SUM(partial_schedules) as partial_schedules,
  SUM(defaulted_schedules) as defaulted_schedules,
  SUM(pending_collections) as pending_collections,
  SUM(defaults_count) as defaults_count,
  SUM(total_default_amount) as total_default_amount,
  SUM(public_defaults) as public_defaults,
  SUM(statutory_defaults) as statutory_defaults,
  SUM(private_defaults) as private_defaults,
  SUM(public_default_amount) as public_default_amount,
  SUM(statutory_default_amount) as statutory_default_amount,
  SUM(private_default_amount) as private_default_amount,
  AVG(avg_loan_duration_days) as avg_loan_duration_days,
  AVG(collection_efficiency_percentage) as collection_efficiency_percentage,
  AVG(avg_completion_percentage) as avg_completion_percentage,
  SUM(total_applications) as total_applications,
  SUM(pending_applications_count) as pending_applications_count,
  SUM(approved_applications_count) as approved_applications_count,
  SUM(declined_applications_count) as declined_applications_count
FROM aggregated_metrics
GROUP BY 
  year, month, day, week, quarter, analysis_date,
  branch_id, branch_name, branch_code, client_type, payroll_type
ORDER BY analysis_date DESC;