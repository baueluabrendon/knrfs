-- Drop the existing view and recreate it with proper repayments due forecast
DROP VIEW IF EXISTS dashboard_analytics_with_branches;

-- Create improved dashboard analytics view with active loans filter for repayments due
CREATE VIEW dashboard_analytics_with_branches AS
WITH date_series AS (
  -- Generate a series of dates for the last 2 years
  SELECT 
    generate_series(
      CURRENT_DATE - INTERVAL '2 years',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date AS analysis_date
),
date_dimensions AS (
  SELECT 
    analysis_date,
    EXTRACT(YEAR FROM analysis_date)::integer AS year,
    EXTRACT(MONTH FROM analysis_date)::integer AS month,
    EXTRACT(DAY FROM analysis_date)::integer AS day,
    EXTRACT(WEEK FROM analysis_date)::integer AS week,
    EXTRACT(QUARTER FROM analysis_date)::integer AS quarter
  FROM date_series
),
branch_dates AS (
  -- Create cartesian product of dates and branches
  SELECT 
    dd.*,
    COALESCE(b.id, '00000000-0000-0000-0000-000000000000'::uuid) AS branch_id,
    COALESCE(b.branch_name, 'All Branches') AS branch_name,
    COALESCE(b.branch_code, 'ALL') AS branch_code
  FROM date_dimensions dd
  CROSS JOIN (
    SELECT id, branch_name, branch_code FROM branches WHERE is_active = true
    UNION ALL
    SELECT '00000000-0000-0000-0000-000000000000'::uuid AS id, 'All Branches' AS branch_name, 'ALL' AS branch_code
  ) b
),
client_types AS (
  SELECT UNNEST(ARRAY['All Types', 'Public Services', 'Statutory Bodies', 'Private Companies']) AS client_type
),
base_combinations AS (
  SELECT 
    bd.*,
    ct.client_type,
    CASE 
      -- Determine payroll type based on client type (can be null for mixed)
      WHEN ct.client_type = 'Public Services' THEN 'public_servant'
      WHEN ct.client_type IN ('Statutory Bodies', 'Private Companies') THEN 'company'
      ELSE NULL
    END AS payroll_type
  FROM branch_dates bd
  CROSS JOIN client_types ct
),
-- Loans disbursed (based on disbursement_date)
loans_disbursed AS (
  SELECT 
    l.disbursement_date,
    COALESCE(br_branch.id, '00000000-0000-0000-0000-000000000000'::uuid) AS branch_id,
    CASE 
      WHEN br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%' THEN 'Public Services'
      WHEN br.client_type ILIKE '%statutory%' THEN 'Statutory Bodies'
      WHEN br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%' THEN 'Private Companies'
      ELSE 'Private Companies'
    END AS client_type,
    COUNT(*) AS loans_released_count,
    COALESCE(SUM(l.principal), 0) AS principal_released,
    COALESCE(SUM(l.gross_loan), 0) AS total_loan_amount
  FROM loans l
  JOIN borrowers br ON l.borrower_id = br.borrower_id
  LEFT JOIN branches br_branch ON br.branch_id = br_branch.id
  WHERE l.disbursement_date IS NOT NULL
  GROUP BY l.disbursement_date, COALESCE(br_branch.id, '00000000-0000-0000-0000-000000000000'::uuid), 
           CASE 
             WHEN br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%' THEN 'Public Services'
             WHEN br.client_type ILIKE '%statutory%' THEN 'Statutory Bodies'
             WHEN br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%' THEN 'Private Companies'
             ELSE 'Private Companies'
           END
),
-- Repayments collected (based on payment_date)
repayments_collected AS (
  SELECT 
    r.payment_date,
    COALESCE(br_branch.id, '00000000-0000-0000-0000-000000000000'::uuid) AS branch_id,
    CASE 
      WHEN br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%' THEN 'Public Services'
      WHEN br.client_type ILIKE '%statutory%' THEN 'Statutory Bodies'
      WHEN br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%' THEN 'Private Companies'
      ELSE 'Private Companies'
    END AS client_type,
    COUNT(*) AS repayments_collected_count,
    COALESCE(SUM(r.amount), 0) AS total_collections
  FROM repayments r
  JOIN loans l ON r.loan_id = l.loan_id
  JOIN borrowers br ON l.borrower_id = br.borrower_id
  LEFT JOIN branches br_branch ON br.branch_id = br_branch.id
  WHERE r.payment_date IS NOT NULL AND r.verification_status = 'approved'
  GROUP BY r.payment_date, COALESCE(br_branch.id, '00000000-0000-0000-0000-000000000000'::uuid),
           CASE 
             WHEN br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%' THEN 'Public Services'
             WHEN br.client_type ILIKE '%statutory%' THEN 'Statutory Bodies'
             WHEN br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%' THEN 'Private Companies'
             ELSE 'Private Companies'
           END
),
-- Repayments due (forecast for collections - only from ACTIVE loans)
repayments_due AS (
  SELECT 
    rs.due_date,
    COALESCE(br_branch.id, '00000000-0000-0000-0000-000000000000'::uuid) AS branch_id,
    CASE 
      WHEN br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%' THEN 'Public Services'
      WHEN br.client_type ILIKE '%statutory%' THEN 'Statutory Bodies'
      WHEN br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%' THEN 'Private Companies'
      ELSE 'Private Companies'
    END AS client_type,
    COUNT(*) AS repayments_due_count,
    COALESCE(SUM(rs.repaymentrs), 0) AS total_due_amount,
    COALESCE(SUM(rs.principalrs), 0) AS principal_due,
    COALESCE(SUM(rs.interestrs), 0) AS interest_due,
    COALESCE(SUM(rs.documentation_feers), 0) AS doc_fees_due,
    COALESCE(SUM(rs.loan_risk_insurancers), 0) AS risk_insurance_due,
    COALESCE(SUM(rs.gst_amountrs), 0) AS gst_due,
    COUNT(CASE WHEN rs.statusrs = 'pending' THEN 1 END) AS pending_schedules,
    COUNT(CASE WHEN rs.statusrs = 'paid' THEN 1 END) AS paid_schedules,
    COUNT(CASE WHEN rs.statusrs = 'partial' THEN 1 END) AS partial_schedules,
    COUNT(CASE WHEN rs.statusrs = 'default' THEN 1 END) AS defaulted_schedules
  FROM repayment_schedule rs
  JOIN loans l ON rs.loan_id = l.loan_id
  JOIN borrowers br ON l.borrower_id = br.borrower_id
  LEFT JOIN branches br_branch ON br.branch_id = br_branch.id
  WHERE rs.due_date IS NOT NULL 
    AND l.loan_status = 'active'  -- Only include scheduled repayments from active loans
  GROUP BY rs.due_date, COALESCE(br_branch.id, '00000000-0000-0000-0000-000000000000'::uuid),
           CASE 
             WHEN br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%' THEN 'Public Services'
             WHEN br.client_type ILIKE '%statutory%' THEN 'Statutory Bodies'
             WHEN br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%' THEN 'Private Companies'
             ELSE 'Private Companies'
           END
),
-- Fee collections (based on settled_date)
fee_collections AS (
  SELECT 
    rs.settled_date,
    COALESCE(br_branch.id, '00000000-0000-0000-0000-000000000000'::uuid) AS branch_id,
    CASE 
      WHEN br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%' THEN 'Public Services'
      WHEN br.client_type ILIKE '%statutory%' THEN 'Statutory Bodies'
      WHEN br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%' THEN 'Private Companies'
      ELSE 'Private Companies'
    END AS client_type,
    COALESCE(SUM(rs.received_documentation_fee), 0) AS doc_fees_collected,
    COALESCE(SUM(rs.received_loan_risk_insurance), 0) AS risk_insurance_collected,
    COALESCE(SUM(rs.received_gst_amount), 0) AS gst_collected,
    COALESCE(SUM(rs.default_charged), 0) AS default_fees_collected
  FROM repayment_schedule rs
  JOIN loans l ON rs.loan_id = l.loan_id
  JOIN borrowers br ON l.borrower_id = br.borrower_id
  LEFT JOIN branches br_branch ON br.branch_id = br_branch.id
  WHERE rs.settled_date IS NOT NULL
  GROUP BY rs.settled_date, COALESCE(br_branch.id, '00000000-0000-0000-0000-000000000000'::uuid),
           CASE 
             WHEN br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%' THEN 'Public Services'
             WHEN br.client_type ILIKE '%statutory%' THEN 'Statutory Bodies'
             WHEN br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%' THEN 'Private Companies'
             ELSE 'Private Companies'
           END
),
-- Active loan counts and outstanding balances (as of analysis_date)
active_loan_metrics AS (
  SELECT 
    bc.analysis_date,
    bc.branch_id,
    bc.client_type,
    COUNT(DISTINCT CASE WHEN l.loan_status = 'active' AND l.disbursement_date <= bc.analysis_date THEN l.loan_id END) AS active_loans_count,
    COUNT(DISTINCT CASE WHEN l.loan_status = 'settled' AND l.settled_date <= bc.analysis_date THEN l.loan_id END) AS settled_loans_count,
    COUNT(DISTINCT CASE WHEN l.loan_status = 'overdue' AND l.disbursement_date <= bc.analysis_date THEN l.loan_id END) AS overdue_loans_count,
    COALESCE(SUM(CASE WHEN l.loan_status = 'active' AND l.disbursement_date <= bc.analysis_date THEN l.outstanding_balance ELSE 0 END), 0) AS total_outstanding,
    COALESCE(SUM(CASE WHEN l.disbursement_date <= bc.analysis_date THEN l.arrears ELSE 0 END), 0) AS total_arrears
  FROM base_combinations bc
  LEFT JOIN loans l ON l.disbursement_date <= bc.analysis_date
  LEFT JOIN borrowers br ON l.borrower_id = br.borrower_id
  LEFT JOIN branches br_branch ON br.branch_id = br_branch.id
  WHERE (bc.branch_id = '00000000-0000-0000-0000-000000000000'::uuid OR COALESCE(br_branch.id, '00000000-0000-0000-0000-000000000000'::uuid) = bc.branch_id)
    AND (bc.client_type = 'All Types' OR 
         CASE 
           WHEN br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%' THEN 'Public Services'
           WHEN br.client_type ILIKE '%statutory%' THEN 'Statutory Bodies'
           WHEN br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%' THEN 'Private Companies'
           ELSE 'Private Companies'
         END = bc.client_type)
  GROUP BY bc.analysis_date, bc.branch_id, bc.client_type
),
-- Borrower demographics (cumulative as of analysis_date)
borrower_demographics AS (
  SELECT 
    bc.analysis_date,
    bc.branch_id,
    bc.client_type,
    COUNT(DISTINCT CASE WHEN br.gender = 'Male' THEN br.borrower_id END) AS male_count,
    COUNT(DISTINCT CASE WHEN br.gender = 'Female' THEN br.borrower_id END) AS female_count,
    COUNT(DISTINCT CASE WHEN (br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%') THEN br.borrower_id END) AS public_service_count,
    COUNT(DISTINCT CASE WHEN br.client_type ILIKE '%statutory%' THEN br.borrower_id END) AS statutory_body_count,
    COUNT(DISTINCT CASE WHEN (br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%') THEN br.borrower_id END) AS private_company_count
  FROM base_combinations bc
  LEFT JOIN borrowers br ON TRUE
  LEFT JOIN branches br_branch ON br.branch_id = br_branch.id
  WHERE (bc.branch_id = '00000000-0000-0000-0000-000000000000'::uuid OR COALESCE(br_branch.id, '00000000-0000-0000-0000-000000000000'::uuid) = bc.branch_id)
    AND (bc.client_type = 'All Types' OR 
         CASE 
           WHEN br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%' THEN 'Public Services'
           WHEN br.client_type ILIKE '%statutory%' THEN 'Statutory Bodies'
           WHEN br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%' THEN 'Private Companies'
           ELSE 'Private Companies'
         END = bc.client_type)
  GROUP BY bc.analysis_date, bc.branch_id, bc.client_type
),
-- Defaults summary
defaults_summary AS (
  SELECT 
    d.date,
    COALESCE(br_branch.id, '00000000-0000-0000-0000-000000000000'::uuid) AS branch_id,
    CASE 
      WHEN br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%' THEN 'Public Services'
      WHEN br.client_type ILIKE '%statutory%' THEN 'Statutory Bodies'
      WHEN br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%' THEN 'Private Companies'
      ELSE 'Private Companies'
    END AS client_type,
    COUNT(*) AS defaults_count,
    COALESCE(SUM(d.default_amount), 0) AS total_default_amount,
    COUNT(CASE WHEN (br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%') THEN 1 END) AS public_defaults,
    COUNT(CASE WHEN br.client_type ILIKE '%statutory%' THEN 1 END) AS statutory_defaults,
    COUNT(CASE WHEN (br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%') THEN 1 END) AS private_defaults,
    COALESCE(SUM(CASE WHEN (br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%') THEN d.default_amount ELSE 0 END), 0) AS public_default_amount,
    COALESCE(SUM(CASE WHEN br.client_type ILIKE '%statutory%' THEN d.default_amount ELSE 0 END), 0) AS statutory_default_amount,
    COALESCE(SUM(CASE WHEN (br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%') THEN d.default_amount ELSE 0 END), 0) AS private_default_amount
  FROM defaults d
  JOIN repayment_schedule rs ON d.schedule_id = rs.schedule_id
  JOIN loans l ON rs.loan_id = l.loan_id
  JOIN borrowers br ON l.borrower_id = br.borrower_id
  LEFT JOIN branches br_branch ON br.branch_id = br_branch.id
  WHERE d.date IS NOT NULL
  GROUP BY d.date, COALESCE(br_branch.id, '00000000-0000-0000-0000-000000000000'::uuid),
           CASE 
             WHEN br.client_type ILIKE '%public%service%' OR br.client_type ILIKE '%government%' THEN 'Public Services'
             WHEN br.client_type ILIKE '%statutory%' THEN 'Statutory Bodies'
             WHEN br.client_type ILIKE '%private%' OR br.client_type ILIKE '%company%' THEN 'Private Companies'
             ELSE 'Private Companies'
           END
)
-- Final aggregation
SELECT 
  bc.analysis_date,
  bc.year,
  bc.month,
  bc.day,
  bc.week,
  bc.quarter,
  bc.branch_id,
  bc.branch_name,
  bc.branch_code,
  bc.client_type,
  bc.payroll_type,
  
  -- Loans disbursed metrics
  COALESCE(ld.loans_released_count, 0) AS loans_released_count,
  COALESCE(ld.principal_released, 0) AS principal_released,
  COALESCE(ld.total_loan_amount, 0) AS total_loan_amount,
  
  -- Repayments collected metrics
  COALESCE(rc.repayments_collected_count, 0) AS repayments_collected_count,
  COALESCE(rc.total_collections, 0) AS total_collections,
  COALESCE(fc.doc_fees_collected, 0) AS doc_fees_collected,
  COALESCE(fc.risk_insurance_collected, 0) AS risk_insurance_collected,
  COALESCE(fc.gst_collected, 0) AS gst_collected,
  COALESCE(fc.default_fees_collected, 0) AS default_fees_collected,
  
  -- Repayments due metrics (forecast)
  COALESCE(rd.repayments_due_count, 0) AS repayments_due_count,
  COALESCE(rd.total_due_amount, 0) AS total_due_amount,
  COALESCE(rd.principal_due, 0) AS principal_due,
  COALESCE(rd.interest_due, 0) AS interest_due,
  COALESCE(rd.doc_fees_due, 0) AS doc_fees_due,
  COALESCE(rd.risk_insurance_due, 0) AS risk_insurance_due,
  COALESCE(rd.gst_due, 0) AS gst_due,
  COALESCE(rd.pending_schedules, 0) AS pending_schedules,
  COALESCE(rd.paid_schedules, 0) AS paid_schedules,
  COALESCE(rd.partial_schedules, 0) AS partial_schedules,
  COALESCE(rd.defaulted_schedules, 0) AS defaulted_schedules,
  
  -- Active loan metrics
  COALESCE(alm.active_loans_count, 0) AS active_loans_count,
  COALESCE(alm.settled_loans_count, 0) AS settled_loans_count,
  COALESCE(alm.overdue_loans_count, 0) AS overdue_loans_count,
  COALESCE(alm.total_outstanding, 0) AS total_outstanding,
  COALESCE(alm.total_arrears, 0) AS total_arrears,
  
  -- Borrower demographics
  COALESCE(bd.male_count, 0) AS male_count,
  COALESCE(bd.female_count, 0) AS female_count,
  COALESCE(bd.public_service_count, 0) AS public_service_count,
  COALESCE(bd.statutory_body_count, 0) AS statutory_body_count,
  COALESCE(bd.private_company_count, 0) AS private_company_count,
  
  -- Defaults metrics
  COALESCE(ds.defaults_count, 0) AS defaults_count,
  COALESCE(ds.total_default_amount, 0) AS total_default_amount,
  COALESCE(ds.public_defaults, 0) AS public_defaults,
  COALESCE(ds.statutory_defaults, 0) AS statutory_defaults,
  COALESCE(ds.private_defaults, 0) AS private_defaults,
  COALESCE(ds.public_default_amount, 0) AS public_default_amount,
  COALESCE(ds.statutory_default_amount, 0) AS statutory_default_amount,
  COALESCE(ds.private_default_amount, 0) AS private_default_amount,
  
  -- New borrowers (placeholder - would need created_at on borrowers)
  0::bigint AS new_borrowers_count,
  0::bigint AS new_male_borrowers,
  0::bigint AS new_female_borrowers,
  0::bigint AS new_public_service,
  0::bigint AS new_statutory_body,
  0::bigint AS new_private_company,
  
  -- Applications (placeholder)
  0::bigint AS total_applications,
  0::bigint AS pending_applications_count,
  0::bigint AS approved_applications_count,
  0::bigint AS declined_applications_count,
  
  -- Additional metrics
  0::integer AS avg_loan_duration_days,
  0::numeric AS collection_efficiency_percentage,
  0::numeric AS avg_completion_percentage,
  0::bigint AS total_missed_payments,
  0::bigint AS total_partial_payments,
  0::numeric AS total_default_fees,
  0::bigint AS at_risk_loans_count,
  0::numeric AS pending_collections

FROM base_combinations bc
LEFT JOIN loans_disbursed ld ON bc.analysis_date = ld.disbursement_date 
  AND bc.branch_id = ld.branch_id 
  AND (bc.client_type = 'All Types' OR bc.client_type = ld.client_type)
LEFT JOIN repayments_collected rc ON bc.analysis_date = rc.payment_date 
  AND bc.branch_id = rc.branch_id 
  AND (bc.client_type = 'All Types' OR bc.client_type = rc.client_type)
LEFT JOIN repayments_due rd ON bc.analysis_date = rd.due_date 
  AND bc.branch_id = rd.branch_id 
  AND (bc.client_type = 'All Types' OR bc.client_type = rd.client_type)
LEFT JOIN fee_collections fc ON bc.analysis_date = fc.settled_date 
  AND bc.branch_id = fc.branch_id 
  AND (bc.client_type = 'All Types' OR bc.client_type = fc.client_type)
LEFT JOIN active_loan_metrics alm ON bc.analysis_date = alm.analysis_date 
  AND bc.branch_id = alm.branch_id 
  AND bc.client_type = alm.client_type
LEFT JOIN borrower_demographics bd ON bc.analysis_date = bd.analysis_date 
  AND bc.branch_id = bd.branch_id 
  AND bc.client_type = bd.client_type
LEFT JOIN defaults_summary ds ON bc.analysis_date = ds.date 
  AND bc.branch_id = ds.branch_id 
  AND (bc.client_type = 'All Types' OR bc.client_type = ds.client_type)
WHERE bc.analysis_date >= CURRENT_DATE - INTERVAL '2 years';