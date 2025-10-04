-- Fix dashboard_analytics_with_branches view with proper date handling
DROP VIEW IF EXISTS dashboard_analytics_with_branches CASCADE;

CREATE VIEW dashboard_analytics_with_branches AS
WITH base_dates AS (
  SELECT DISTINCT
    COALESCE(l.disbursement_date, r.payment_date, rs.due_date, b.date_employed)::date as analysis_date
  FROM loans l
  FULL OUTER JOIN repayments r ON l.loan_id = r.loan_id
  FULL OUTER JOIN repayment_schedule rs ON l.loan_id = rs.loan_id
  FULL OUTER JOIN borrowers b ON l.borrower_id = b.borrower_id
  WHERE COALESCE(l.disbursement_date, r.payment_date, rs.due_date, b.date_employed) IS NOT NULL
),
date_periods AS (
  SELECT 
    analysis_date,
    EXTRACT(YEAR FROM analysis_date)::INT as year,
    EXTRACT(MONTH FROM analysis_date)::INT as month,
    EXTRACT(DAY FROM analysis_date)::INT as day,
    EXTRACT(WEEK FROM analysis_date)::INT as week,
    EXTRACT(QUARTER FROM analysis_date)::INT as quarter
  FROM base_dates
),
outstanding_by_period AS (
  SELECT 
    dp.analysis_date,
    l.loan_id,
    b.branch_id,
    CASE 
      WHEN l.disbursement_date > dp.analysis_date THEN 0
      ELSE l.outstanding_balance - COALESCE(
        (SELECT SUM(amount) FROM repayments r2 
         WHERE r2.loan_id = l.loan_id 
         AND r2.payment_date > dp.analysis_date
         AND r2.verification_status = 'approved'),
        0
      )
    END as period_outstanding
  FROM date_periods dp
  CROSS JOIN loans l
  LEFT JOIN borrowers b ON l.borrower_id = b.borrower_id
  WHERE l.loan_status IN ('active', 'overdue')
),
loans_released AS (
  SELECT 
    dp.*,
    l.loan_id,
    l.principal,
    l.gross_loan,
    b.branch_id,
    b.client_type,
    rs.payroll_type
  FROM date_periods dp
  JOIN loans l ON l.disbursement_date = dp.analysis_date
  LEFT JOIN borrowers b ON l.borrower_id = b.borrower_id
  LEFT JOIN repayment_schedule rs ON l.loan_id = rs.loan_id AND rs.payment_number = 1
),
repayments_due AS (
  SELECT 
    dp.*,
    rs.schedule_id,
    rs.loan_id,
    rs.repaymentrs as due_amount,
    rs.principalrs as principal_due,
    rs.interestrs as interest_due,
    rs.documentation_feers as doc_fee_due,
    rs.loan_risk_insurancers as risk_insurance_due,
    rs.gst_amountrs as gst_due,
    b.branch_id,
    b.client_type,
    rs.payroll_type
  FROM date_periods dp
  JOIN repayment_schedule rs ON rs.due_date = dp.analysis_date
  LEFT JOIN loans l ON rs.loan_id = l.loan_id
  LEFT JOIN borrowers b ON l.borrower_id = b.borrower_id
  WHERE rs.statusrs = 'pending'
    AND l.loan_status IN ('active', 'overdue')
),
repayments_collected AS (
  SELECT 
    dp.*,
    r.repayment_id,
    r.loan_id,
    r.amount,
    b.branch_id,
    b.client_type,
    rs.payroll_type
  FROM date_periods dp
  JOIN repayments r ON r.payment_date = dp.analysis_date
  LEFT JOIN loans l ON r.loan_id = l.loan_id
  LEFT JOIN borrowers b ON l.borrower_id = b.borrower_id
  LEFT JOIN repayment_schedule rs ON l.loan_id = rs.loan_id AND rs.payment_number = 1
  WHERE r.verification_status = 'approved'
),
loans_status AS (
  SELECT 
    dp.*,
    l.loan_id,
    l.loan_status,
    l.loan_repayment_status,
    b.branch_id,
    b.client_type
  FROM date_periods dp
  CROSS JOIN loans l
  LEFT JOIN borrowers b ON l.borrower_id = b.borrower_id
  WHERE (l.disbursement_date <= dp.analysis_date)
    AND (l.settled_date IS NULL OR l.settled_date > dp.analysis_date)
),
defaults_data AS (
  SELECT 
    dp.*,
    d.arrear_id,
    d.default_amount,
    rs.schedule_id,
    l.loan_id,
    b.branch_id,
    b.client_type
  FROM date_periods dp
  JOIN defaults d ON d.date = dp.analysis_date
  LEFT JOIN repayment_schedule rs ON d.schedule_id = rs.schedule_id
  LEFT JOIN loans l ON rs.loan_id = l.loan_id
  LEFT JOIN borrowers b ON l.borrower_id = b.borrower_id
  WHERE d.status = 'active'
),
borrowers_created AS (
  SELECT 
    dp.*,
    b.borrower_id,
    b.gender,
    b.client_type,
    b.branch_id
  FROM date_periods dp
  JOIN borrowers b ON b.date_employed = dp.analysis_date
),
applications_data AS (
  SELECT 
    dp.*,
    a.application_id,
    a.status,
    (a.jsonb_data->>'branchId')::uuid as branch_id
  FROM date_periods dp
  JOIN applications a ON a.uploaded_at::date = dp.analysis_date
)

SELECT 
  dp.analysis_date,
  dp.year,
  dp.month,
  dp.day,
  dp.week,
  dp.quarter,
  COALESCE(lr.branch_id, rd.branch_id, rc.branch_id, ls.branch_id, dd.branch_id, bc.branch_id, ad.branch_id) as branch_id,
  br.branch_name,
  br.branch_code,
  COALESCE(lr.client_type, rd.client_type, rc.client_type, ls.client_type, dd.client_type, bc.client_type) as client_type,
  COALESCE(lr.payroll_type, rd.payroll_type, rc.payroll_type) as payroll_type,
  
  COUNT(DISTINCT lr.loan_id) as loans_released_count,
  COALESCE(SUM(lr.principal), 0) as principal_released,
  COALESCE(SUM(lr.gross_loan), 0) as total_loan_amount,
  
  COUNT(DISTINCT rd.schedule_id) as repayments_due_count,
  COALESCE(SUM(rd.due_amount), 0) as total_due_amount,
  COALESCE(SUM(rd.principal_due), 0) as principal_due,
  COALESCE(SUM(rd.interest_due), 0) as interest_due,
  COALESCE(SUM(rd.doc_fee_due), 0) as doc_fees_due,
  COALESCE(SUM(rd.risk_insurance_due), 0) as risk_insurance_due,
  COALESCE(SUM(rd.gst_due), 0) as gst_due,
  
  COUNT(DISTINCT CASE WHEN rs_all.statusrs = 'pending' AND rs_all.due_date = dp.analysis_date THEN rs_all.schedule_id END) as pending_schedules,
  COUNT(DISTINCT CASE WHEN rs_all.statusrs = 'paid' AND rs_all.settled_date = dp.analysis_date THEN rs_all.schedule_id END) as paid_schedules,
  COUNT(DISTINCT CASE WHEN rs_all.statusrs = 'partial' AND rs_all.settled_date = dp.analysis_date THEN rs_all.schedule_id END) as partial_schedules,
  COUNT(DISTINCT CASE WHEN rs_all.statusrs = 'default' AND rs_all.settled_date = dp.analysis_date THEN rs_all.schedule_id END) as defaulted_schedules,
  
  COUNT(DISTINCT rc.repayment_id) as repayments_collected_count,
  COALESCE(SUM(rc.amount), 0) as total_collections,
  COALESCE(SUM(rs_paid.received_documentation_fee), 0) as doc_fees_collected,
  COALESCE(SUM(rs_paid.received_loan_risk_insurance), 0) as risk_insurance_collected,
  COALESCE(SUM(rs_paid.received_gst_amount), 0) as gst_collected,
  COALESCE(SUM(rs_paid.default_charged), 0) as default_fees_collected,
  
  COUNT(DISTINCT CASE WHEN ls.loan_status = 'active' THEN ls.loan_id END) as active_loans_count,
  COUNT(DISTINCT CASE WHEN ls.loan_status = 'settled' AND l_settled.settled_date = dp.analysis_date THEN ls.loan_id END) as settled_loans_count,
  COUNT(DISTINCT CASE WHEN ls.loan_status = 'overdue' THEN ls.loan_id END) as overdue_loans_count,
  
  COALESCE(SUM(CASE WHEN obp.analysis_date = dp.analysis_date THEN obp.period_outstanding END), 0) as total_outstanding,
  COALESCE(SUM(CASE WHEN ls.loan_status IN ('active', 'overdue') THEN l_active.arrears END), 0) as total_arrears,
  
  COUNT(DISTINCT CASE WHEN l_active.loan_repayment_status IN ('partial', 'default') THEN l_active.loan_id END) as at_risk_loans_count,
  COALESCE(SUM(l_active.missed_payments_count), 0) as total_missed_payments,
  COALESCE(SUM(l_active.partial_payments_count), 0) as total_partial_payments,
  COALESCE(SUM(l_active.default_fees_accumulated), 0) as total_default_fees,
  
  COUNT(DISTINCT CASE WHEN bc.gender = 'Male' THEN bc.borrower_id END) as male_count,
  COUNT(DISTINCT CASE WHEN bc.gender = 'Female' THEN bc.borrower_id END) as female_count,
  COUNT(DISTINCT CASE WHEN bc.client_type = 'Public Service' THEN bc.borrower_id END) as public_service_count,
  COUNT(DISTINCT CASE WHEN bc.client_type = 'Statutory Body' THEN bc.borrower_id END) as statutory_body_count,
  COUNT(DISTINCT CASE WHEN bc.client_type = 'Private Company' THEN bc.borrower_id END) as private_company_count,
  
  COALESCE(SUM(rd.due_amount) - SUM(rc.amount), 0) as pending_collections,
  CASE 
    WHEN SUM(rd.due_amount) > 0 
    THEN (SUM(rc.amount) / SUM(rd.due_amount) * 100)
    ELSE 0 
  END as collection_efficiency_percentage,
  
  COUNT(DISTINCT dd.arrear_id) as defaults_count,
  COALESCE(SUM(dd.default_amount), 0) as total_default_amount,
  COUNT(DISTINCT CASE WHEN dd.client_type = 'Public Service' THEN dd.arrear_id END) as public_defaults,
  COUNT(DISTINCT CASE WHEN dd.client_type = 'Statutory Body' THEN dd.arrear_id END) as statutory_defaults,
  COUNT(DISTINCT CASE WHEN dd.client_type = 'Private Company' THEN dd.arrear_id END) as private_defaults,
  COALESCE(SUM(CASE WHEN dd.client_type = 'Public Service' THEN dd.default_amount END), 0) as public_default_amount,
  COALESCE(SUM(CASE WHEN dd.client_type = 'Statutory Body' THEN dd.default_amount END), 0) as statutory_default_amount,
  COALESCE(SUM(CASE WHEN dd.client_type = 'Private Company' THEN dd.default_amount END), 0) as private_default_amount,
  
  COUNT(DISTINCT bc.borrower_id) as new_borrowers_count,
  COUNT(DISTINCT CASE WHEN bc.gender = 'Male' THEN bc.borrower_id END) as new_male_borrowers,
  COUNT(DISTINCT CASE WHEN bc.gender = 'Female' THEN bc.borrower_id END) as new_female_borrowers,
  COUNT(DISTINCT CASE WHEN bc.client_type = 'Public Service' THEN bc.borrower_id END) as new_public_service,
  COUNT(DISTINCT CASE WHEN bc.client_type = 'Statutory Body' THEN bc.borrower_id END) as new_statutory_body,
  COUNT(DISTINCT CASE WHEN bc.client_type = 'Private Company' THEN bc.borrower_id END) as new_private_company,
  
  COUNT(DISTINCT ad.application_id) as total_applications,
  COUNT(DISTINCT CASE WHEN ad.status = 'pending' THEN ad.application_id END) as pending_applications_count,
  COUNT(DISTINCT CASE WHEN ad.status = 'approved' THEN ad.application_id END) as approved_applications_count,
  COUNT(DISTINCT CASE WHEN ad.status = 'declined' THEN ad.application_id END) as declined_applications_count,
  
  AVG((l_settled.settled_date - l_settled.disbursement_date))::INT as avg_loan_duration_days,
  AVG(CASE WHEN l_active.loan_status IN ('active', 'overdue') THEN l_active.repayment_completion_percentage END) as avg_completion_percentage

FROM date_periods dp
LEFT JOIN loans_released lr ON dp.analysis_date = lr.analysis_date
LEFT JOIN repayments_due rd ON dp.analysis_date = rd.analysis_date
LEFT JOIN repayments_collected rc ON dp.analysis_date = rc.analysis_date
LEFT JOIN loans_status ls ON dp.analysis_date = ls.analysis_date
LEFT JOIN defaults_data dd ON dp.analysis_date = dd.analysis_date
LEFT JOIN borrowers_created bc ON dp.analysis_date = bc.analysis_date
LEFT JOIN applications_data ad ON dp.analysis_date = ad.analysis_date
LEFT JOIN outstanding_by_period obp ON dp.analysis_date = obp.analysis_date
LEFT JOIN branches br ON COALESCE(lr.branch_id, rd.branch_id, rc.branch_id, ls.branch_id, dd.branch_id, bc.branch_id, ad.branch_id) = br.id
LEFT JOIN repayment_schedule rs_all ON dp.analysis_date IN (rs_all.due_date, rs_all.settled_date)
LEFT JOIN repayment_schedule rs_paid ON rc.loan_id = rs_paid.loan_id AND rc.analysis_date = rs_paid.settled_date
LEFT JOIN loans l_settled ON ls.loan_id = l_settled.loan_id AND l_settled.loan_status = 'settled'
LEFT JOIN loans l_active ON ls.loan_id = l_active.loan_id AND l_active.loan_status IN ('active', 'overdue')

GROUP BY 
  dp.analysis_date,
  dp.year,
  dp.month,
  dp.day,
  dp.week,
  dp.quarter,
  br.branch_name,
  br.branch_code,
  COALESCE(lr.branch_id, rd.branch_id, rc.branch_id, ls.branch_id, dd.branch_id, bc.branch_id, ad.branch_id),
  COALESCE(lr.client_type, rd.client_type, rc.client_type, ls.client_type, dd.client_type, bc.client_type),
  COALESCE(lr.payroll_type, rd.payroll_type, rc.payroll_type)

ORDER BY dp.analysis_date DESC;