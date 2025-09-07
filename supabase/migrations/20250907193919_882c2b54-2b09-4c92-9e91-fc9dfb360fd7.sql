-- Create comprehensive analytics view for dashboard charts
CREATE OR REPLACE VIEW public.dashboard_analytics_view AS
WITH date_series AS (
  SELECT 
    date_trunc('day', generate_series(
      '2023-01-01'::date,
      CURRENT_DATE + interval '30 days',
      '1 day'::interval
    )) AS analysis_date
),
loan_disbursements AS (
  SELECT 
    disbursement_date,
    COUNT(*) as loans_released_count,
    SUM(principal) as principal_released,
    SUM(gross_loan) as total_loan_amount
  FROM loans
  WHERE disbursement_date IS NOT NULL
  GROUP BY disbursement_date
),
daily_repayments AS (
  SELECT 
    payment_date,
    COUNT(*) as repayments_count,
    SUM(amount) as total_collections
  FROM repayments
  WHERE verification_status = 'approved'
    AND payment_date IS NOT NULL
  GROUP BY payment_date
),
schedule_due_amounts AS (
  SELECT 
    due_date,
    SUM(repaymentrs) as total_due_amount,
    COUNT(*) as repayments_due_count
  FROM repayment_schedule
  WHERE statusrs IN ('pending', 'partial', 'default')
  GROUP BY due_date
),
fee_collections AS (
  SELECT 
    rs.due_date,
    SUM(COALESCE(rs.received_documentation_fee, 0)) as doc_fees_collected,
    SUM(COALESCE(rs.received_loan_risk_insurance, 0)) as risk_insurance_collected,
    SUM(COALESCE(d.default_amount, 0)) as default_fees_collected
  FROM repayment_schedule rs
  LEFT JOIN defaults d ON rs.schedule_id = d.schedule_id
  GROUP BY rs.due_date
),
loan_status_counts AS (
  SELECT 
    l.created_at::date as analysis_date,
    COUNT(CASE WHEN l.loan_status = 'active' THEN 1 END) as active_loans_count,
    COUNT(CASE WHEN l.loan_status = 'settled' THEN 1 END) as settled_loans_count,
    SUM(CASE WHEN l.loan_status = 'active' THEN l.outstanding_balance ELSE 0 END) as total_outstanding
  FROM loans l
  GROUP BY l.created_at::date
),
borrower_analytics AS (
  SELECT 
    l.disbursement_date,
    COUNT(DISTINCT b.borrower_id) as new_borrowers_count,
    COUNT(CASE WHEN b.gender = 'Male' THEN 1 END) as male_count,
    COUNT(CASE WHEN b.gender = 'Female' THEN 1 END) as female_count,
    COUNT(CASE WHEN LOWER(b.department_company) LIKE '%public%' OR LOWER(b.department_company) LIKE '%government%' THEN 1 END) as public_service_count,
    COUNT(CASE WHEN LOWER(b.department_company) LIKE '%statutory%' OR LOWER(b.department_company) LIKE '%authority%' THEN 1 END) as statutory_body_count,
    COUNT(CASE WHEN LOWER(b.department_company) NOT LIKE '%public%' 
               AND LOWER(b.department_company) NOT LIKE '%government%'
               AND LOWER(b.department_company) NOT LIKE '%statutory%'
               AND LOWER(b.department_company) NOT LIKE '%authority%' 
               AND b.department_company IS NOT NULL THEN 1 END) as private_company_count
  FROM loans l
  JOIN borrowers b ON l.borrower_id = b.borrower_id
  WHERE l.disbursement_date IS NOT NULL
  GROUP BY l.disbursement_date
),
default_analytics AS (
  SELECT 
    d.date as analysis_date,
    COUNT(*) as defaults_count,
    SUM(d.default_amount) as total_default_amount,
    COUNT(CASE WHEN LOWER(b.department_company) LIKE '%public%' OR LOWER(b.department_company) LIKE '%government%' THEN 1 END) as public_defaults,
    COUNT(CASE WHEN LOWER(b.department_company) LIKE '%statutory%' OR LOWER(b.department_company) LIKE '%authority%' THEN 1 END) as statutory_defaults,
    COUNT(CASE WHEN LOWER(b.department_company) NOT LIKE '%public%' 
               AND LOWER(b.department_company) NOT LIKE '%government%'
               AND LOWER(b.department_company) NOT LIKE '%statutory%'
               AND LOWER(b.department_company) NOT LIKE '%authority%' 
               AND b.department_company IS NOT NULL THEN 1 END) as private_defaults
  FROM defaults d
  JOIN repayment_schedule rs ON d.schedule_id = rs.schedule_id
  JOIN loans l ON rs.loan_id = l.loan_id
  JOIN borrowers b ON l.borrower_id = b.borrower_id
  GROUP BY d.date
)
SELECT 
  ds.analysis_date,
  -- Time period extracts for filtering
  EXTRACT(year from ds.analysis_date) as year,
  EXTRACT(month from ds.analysis_date) as month,
  EXTRACT(week from ds.analysis_date) as week,
  EXTRACT(day from ds.analysis_date) as day,
  EXTRACT(quarter from ds.analysis_date) as quarter,
  
  -- Loan disbursement data
  COALESCE(ld.loans_released_count, 0) as loans_released_count,
  COALESCE(ld.principal_released, 0) as principal_released,
  COALESCE(ld.total_loan_amount, 0) as total_loan_amount,
  
  -- Repayment collections data
  COALESCE(dr.repayments_count, 0) as repayments_collected_count,
  COALESCE(dr.total_collections, 0) as total_collections,
  
  -- Due amounts
  COALESCE(sda.total_due_amount, 0) as total_due_amount,
  COALESCE(sda.repayments_due_count, 0) as repayments_due_count,
  
  -- Fee collections
  COALESCE(fc.doc_fees_collected, 0) as doc_fees_collected,
  COALESCE(fc.risk_insurance_collected, 0) as risk_insurance_collected,
  COALESCE(fc.default_fees_collected, 0) as default_fees_collected,
  
  -- Loan status counts
  COALESCE(lsc.active_loans_count, 0) as active_loans_count,
  COALESCE(lsc.settled_loans_count, 0) as settled_loans_count,
  COALESCE(lsc.total_outstanding, 0) as total_outstanding,
  
  -- Borrower analytics
  COALESCE(ba.new_borrowers_count, 0) as new_borrowers_count,
  COALESCE(ba.male_count, 0) as male_count,
  COALESCE(ba.female_count, 0) as female_count,
  COALESCE(ba.public_service_count, 0) as public_service_count,
  COALESCE(ba.statutory_body_count, 0) as statutory_body_count,
  COALESCE(ba.private_company_count, 0) as private_company_count,
  
  -- Default analytics
  COALESCE(da.defaults_count, 0) as defaults_count,
  COALESCE(da.total_default_amount, 0) as total_default_amount,
  COALESCE(da.public_defaults, 0) as public_defaults,
  COALESCE(da.statutory_defaults, 0) as statutory_defaults,
  COALESCE(da.private_defaults, 0) as private_defaults

FROM date_series ds
LEFT JOIN loan_disbursements ld ON ds.analysis_date = ld.disbursement_date
LEFT JOIN daily_repayments dr ON ds.analysis_date = dr.payment_date
LEFT JOIN schedule_due_amounts sda ON ds.analysis_date = sda.due_date
LEFT JOIN fee_collections fc ON ds.analysis_date = fc.due_date
LEFT JOIN loan_status_counts lsc ON ds.analysis_date = lsc.analysis_date
LEFT JOIN borrower_analytics ba ON ds.analysis_date = ba.disbursement_date
LEFT JOIN default_analytics da ON ds.analysis_date = da.analysis_date
ORDER BY ds.analysis_date;

-- Create helper function to aggregate analytics data by time period
CREATE OR REPLACE FUNCTION get_dashboard_analytics(
  p_start_date DATE DEFAULT '2024-01-01',
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_period_type TEXT DEFAULT 'monthly'
) RETURNS TABLE (
  period_label TEXT,
  principal_released NUMERIC,
  total_collections NUMERIC,
  total_due_amount NUMERIC,
  total_outstanding NUMERIC,
  doc_fees_collected NUMERIC,
  risk_insurance_collected NUMERIC,
  default_fees_collected NUMERIC,
  loans_released_count BIGINT,
  active_loans_count BIGINT,
  repayments_collected_count BIGINT,
  settled_loans_count BIGINT,
  new_borrowers_count BIGINT,
  male_count BIGINT,
  female_count BIGINT,
  public_service_count BIGINT,
  statutory_body_count BIGINT,
  private_company_count BIGINT,
  defaults_count BIGINT,
  public_defaults BIGINT,
  statutory_defaults BIGINT,
  private_defaults BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  CASE p_period_type
    WHEN 'daily' THEN
      RETURN QUERY
      SELECT 
        TO_CHAR(dav.analysis_date, 'DD Mon') as period_label,
        SUM(dav.principal_released)::NUMERIC,
        SUM(dav.total_collections)::NUMERIC,
        SUM(dav.total_due_amount)::NUMERIC,
        SUM(dav.total_outstanding)::NUMERIC,
        SUM(dav.doc_fees_collected)::NUMERIC,
        SUM(dav.risk_insurance_collected)::NUMERIC,
        SUM(dav.default_fees_collected)::NUMERIC,
        SUM(dav.loans_released_count)::BIGINT,
        SUM(dav.active_loans_count)::BIGINT,
        SUM(dav.repayments_collected_count)::BIGINT,
        SUM(dav.settled_loans_count)::BIGINT,
        SUM(dav.new_borrowers_count)::BIGINT,
        SUM(dav.male_count)::BIGINT,
        SUM(dav.female_count)::BIGINT,
        SUM(dav.public_service_count)::BIGINT,
        SUM(dav.statutory_body_count)::BIGINT,
        SUM(dav.private_company_count)::BIGINT,
        SUM(dav.defaults_count)::BIGINT,
        SUM(dav.public_defaults)::BIGINT,
        SUM(dav.statutory_defaults)::BIGINT,
        SUM(dav.private_defaults)::BIGINT
      FROM dashboard_analytics_view dav
      WHERE dav.analysis_date BETWEEN p_start_date AND p_end_date
      GROUP BY dav.analysis_date
      ORDER BY dav.analysis_date;
      
    WHEN 'weekly' THEN
      RETURN QUERY
      SELECT 
        'Week ' || EXTRACT(week FROM dav.analysis_date)::TEXT as period_label,
        SUM(dav.principal_released)::NUMERIC,
        SUM(dav.total_collections)::NUMERIC,
        SUM(dav.total_due_amount)::NUMERIC,
        SUM(dav.total_outstanding)::NUMERIC,
        SUM(dav.doc_fees_collected)::NUMERIC,
        SUM(dav.risk_insurance_collected)::NUMERIC,
        SUM(dav.default_fees_collected)::NUMERIC,
        SUM(dav.loans_released_count)::BIGINT,
        SUM(dav.active_loans_count)::BIGINT,
        SUM(dav.repayments_collected_count)::BIGINT,
        SUM(dav.settled_loans_count)::BIGINT,
        SUM(dav.new_borrowers_count)::BIGINT,
        SUM(dav.male_count)::BIGINT,
        SUM(dav.female_count)::BIGINT,
        SUM(dav.public_service_count)::BIGINT,
        SUM(dav.statutory_body_count)::BIGINT,
        SUM(dav.private_company_count)::BIGINT,
        SUM(dav.defaults_count)::BIGINT,
        SUM(dav.public_defaults)::BIGINT,
        SUM(dav.statutory_defaults)::BIGINT,
        SUM(dav.private_defaults)::BIGINT
      FROM dashboard_analytics_view dav
      WHERE dav.analysis_date BETWEEN p_start_date AND p_end_date
      GROUP BY dav.year, dav.week
      ORDER BY dav.year, dav.week;
      
    WHEN 'monthly' THEN
      RETURN QUERY
      SELECT 
        TO_CHAR(DATE_TRUNC('month', dav.analysis_date), 'Mon YYYY') as period_label,
        SUM(dav.principal_released)::NUMERIC,
        SUM(dav.total_collections)::NUMERIC,
        SUM(dav.total_due_amount)::NUMERIC,
        SUM(dav.total_outstanding)::NUMERIC,
        SUM(dav.doc_fees_collected)::NUMERIC,
        SUM(dav.risk_insurance_collected)::NUMERIC,
        SUM(dav.default_fees_collected)::NUMERIC,
        SUM(dav.loans_released_count)::BIGINT,
        SUM(dav.active_loans_count)::BIGINT,
        SUM(dav.repayments_collected_count)::BIGINT,
        SUM(dav.settled_loans_count)::BIGINT,
        SUM(dav.new_borrowers_count)::BIGINT,
        SUM(dav.male_count)::BIGINT,
        SUM(dav.female_count)::BIGINT,
        SUM(dav.public_service_count)::BIGINT,
        SUM(dav.statutory_body_count)::BIGINT,
        SUM(dav.private_company_count)::BIGINT,
        SUM(dav.defaults_count)::BIGINT,
        SUM(dav.public_defaults)::BIGINT,
        SUM(dav.statutory_defaults)::BIGINT,
        SUM(dav.private_defaults)::BIGINT
      FROM dashboard_analytics_view dav
      WHERE dav.analysis_date BETWEEN p_start_date AND p_end_date
      GROUP BY dav.year, dav.month
      ORDER BY dav.year, dav.month;
      
    WHEN 'quarterly' THEN
      RETURN QUERY
      SELECT 
        'Q' || dav.quarter::TEXT || ' ' || dav.year::TEXT as period_label,
        SUM(dav.principal_released)::NUMERIC,
        SUM(dav.total_collections)::NUMERIC,
        SUM(dav.total_due_amount)::NUMERIC,
        SUM(dav.total_outstanding)::NUMERIC,
        SUM(dav.doc_fees_collected)::NUMERIC,
        SUM(dav.risk_insurance_collected)::NUMERIC,
        SUM(dav.default_fees_collected)::NUMERIC,
        SUM(dav.loans_released_count)::BIGINT,
        SUM(dav.active_loans_count)::BIGINT,
        SUM(dav.repayments_collected_count)::BIGINT,
        SUM(dav.settled_loans_count)::BIGINT,
        SUM(dav.new_borrowers_count)::BIGINT,
        SUM(dav.male_count)::BIGINT,
        SUM(dav.female_count)::BIGINT,
        SUM(dav.public_service_count)::BIGINT,
        SUM(dav.statutory_body_count)::BIGINT,
        SUM(dav.private_company_count)::BIGINT,
        SUM(dav.defaults_count)::BIGINT,
        SUM(dav.public_defaults)::BIGINT,
        SUM(dav.statutory_defaults)::BIGINT,
        SUM(dav.private_defaults)::BIGINT
      FROM dashboard_analytics_view dav
      WHERE dav.analysis_date BETWEEN p_start_date AND p_end_date
      GROUP BY dav.year, dav.quarter
      ORDER BY dav.year, dav.quarter;
      
    WHEN 'yearly' THEN
      RETURN QUERY
      SELECT 
        dav.year::TEXT as period_label,
        SUM(dav.principal_released)::NUMERIC,
        SUM(dav.total_collections)::NUMERIC,
        SUM(dav.total_due_amount)::NUMERIC,
        SUM(dav.total_outstanding)::NUMERIC,
        SUM(dav.doc_fees_collected)::NUMERIC,
        SUM(dav.risk_insurance_collected)::NUMERIC,
        SUM(dav.default_fees_collected)::NUMERIC,
        SUM(dav.loans_released_count)::BIGINT,
        SUM(dav.active_loans_count)::BIGINT,
        SUM(dav.repayments_collected_count)::BIGINT,
        SUM(dav.settled_loans_count)::BIGINT,
        SUM(dav.new_borrowers_count)::BIGINT,
        SUM(dav.male_count)::BIGINT,
        SUM(dav.female_count)::BIGINT,
        SUM(dav.public_service_count)::BIGINT,
        SUM(dav.statutory_body_count)::BIGINT,
        SUM(dav.private_company_count)::BIGINT,
        SUM(dav.defaults_count)::BIGINT,
        SUM(dav.public_defaults)::BIGINT,
        SUM(dav.statutory_defaults)::BIGINT,
        SUM(dav.private_defaults)::BIGINT
      FROM dashboard_analytics_view dav
      WHERE dav.analysis_date BETWEEN p_start_date AND p_end_date
      GROUP BY dav.year
      ORDER BY dav.year;
  END CASE;
END;
$$;